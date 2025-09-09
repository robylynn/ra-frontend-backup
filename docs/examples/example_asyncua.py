import asyncio
import logging
from typing import Dict, Any, List

from asyncua import Client, ua
from fastapi import FastAPI, WebSocket, APIRouter
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
_logger = logging.getLogger(__name__)

app = FastAPI(
    title="OPC-UA Backend",
    description="A simple backend for browsing and subscribing to OPC-UA servers.",
)
opc_router = APIRouter(prefix="/opc")

# --- Pydantic Models for API Data Validation ---
class BrowseRequest(BaseModel):
    endpoint_url: str

class SubscribeRequest(BaseModel):
    node_ids: List[str]

# --- Global state to hold active subscriptions and clients ---
# Note: In a production system, this should be more robust
# and handle disconnections gracefully.
active_clients: Dict[str, Client] = {}

# --- WebSocket Subscription Handler ---
class SubHandler:
    """
    Subscription Handler. To receive events from server for a subscription
    """
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.is_active = True

    def datachange_notification(self, node, val, data):
        """
        Called for every datachange notification from the server.
        """
        _logger.info(f"New data change event on node {node}: {val}")
        if self.is_active:
            try:
                # Use asyncio.run_coroutine_threadsafe to run the send_json in the main event loop
                asyncio.run_coroutine_threadsafe(
                    self.websocket.send_json({"nodeId": node.nodeid.to_string(), "value": val}),
                    asyncio.get_event_loop()
                )
            except Exception as e:
                _logger.error(f"Error sending data to WebSocket: {e}")
                self.is_active = False

    def event_notification(self, event):
        """
        Called for every event notification from the server.
        """
        _logger.info("New event notification: %s", event)

# --- Recursive Node Browsing Function ---
async def browse_nodes_recursively(client: Client, parent_node: ua.Node, max_depth: int = 3, current_depth: int = 0) -> Dict[str, Any]:
    """
    Recursively browses the OPC-UA node tree from a starting node.
    """
    if current_depth >= max_depth:
        return {"name": await parent_node.read_browse_name(), "nodeId": parent_node.nodeid.to_string(), "children": []}

    try:
        children = await parent_node.get_children()
        children_list = []
        for child in children:
            child_node = await client.get_node(child.nodeid)
            node_class = await child_node.read_node_class()
            node_name = (await child_node.read_display_name()).to_string()

            if node_class in [ua.NodeClass.Object, ua.NodeClass.ObjectType]:
                # Recursively browse objects
                sub_tree = await browse_nodes_recursively(client, child, max_depth, current_depth + 1)
                children_list.append({
                    "name": node_name,
                    "nodeId": child.nodeid.to_string(),
                    "children": sub_tree.get("children", [])
                })
            elif node_class == ua.NodeClass.Variable:
                # Add variables as leaf nodes
                children_list.append({
                    "name": node_name,
                    "nodeId": child.nodeid.to_string(),
                })
        
        return {
            "name": (await parent_node.read_display_name()).to_string(),
            "nodeId": parent_node.nodeid.to_string(),
            "children": children_list,
        }

    except Exception as e:
        _logger.error(f"Error browsing nodes: {e}")
        return {"name": "Error", "nodeId": parent_node.nodeid.to_string(), "children": []}

# --- API Routes ---
@opc_router.post("/browse")
async def browse_server_nodes(request: BrowseRequest):
    """
    Connects to an OPC-UA server and browses its node tree.
    """
    try:
        client = Client(url=request.endpoint_url)
        await client.connect()
        _logger.info(f"Connected to OPC-UA server at {request.endpoint_url}")
        
        objects_node = await client.nodes.objects.get_children()
        browse_tree = []
        for obj in objects_node:
            node_tree = await browse_nodes_recursively(client, obj)
            browse_tree.append(node_tree)

        await client.disconnect()
        return {"status": "success", "tree": browse_tree}

    except Exception as e:
        _logger.error(f"Failed to browse server: {e}")
        return {"status": "error", "message": str(e)}, 500

@opc_router.websocket("/subscribe")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time OPC-UA data subscriptions.
    """
    await websocket.accept()
    _logger.info("WebSocket connection established.")

    client = None
    sub = None
    handler = SubHandler(websocket)

    try:
        # Client sends the endpoint URL first
        data = await websocket.receive_json()
        endpoint_url = data.get("endpoint_url")
        node_ids = data.get("node_ids", [])
        
        if not endpoint_url or not node_ids:
            await websocket.send_json({"error": "Invalid request. 'endpoint_url' and 'node_ids' are required."})
            await websocket.close()
            return

        client = Client(url=endpoint_url)
        await client.connect()
        _logger.info(f"Connected to OPC-UA server for subscription at {endpoint_url}")

        # Create subscription
        sub = await client.create_subscription(500, handler)
        
        nodes = [client.get_node(node_id) for node_id in node_ids]
        handles = await sub.subscribe_data_change(nodes)
        
        # Keep the connection open until closed by the client
        while True:
            # We need a small delay to keep the loop from spinning too fast
            # and to allow the subscription handler to do its work.
            await asyncio.sleep(1)

    except asyncio.CancelledError:
        _logger.info("WebSocket connection closed by client.")
    except Exception as e:
        _logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
    finally:
        if sub:
            await sub.delete_all_items()
            await sub.delete()
        if client:
            await client.disconnect()
        _logger.info("Subscription and client disconnected.")
        await websocket.close()

app.include_router(opc_router)

# --- Main Entry Point for running with uvicorn ---
# To run this file, save it as main.py and execute:
# uvicorn main:app --reload
#
# A sample of the backend in action might look like this: 
