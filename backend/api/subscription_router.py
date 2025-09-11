# ./api/zmq_router.py
import asyncio
from typing import Dict, Set, List, Any
import uuid
import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, status, Query
from loguru import logger

from backend.api.data_router import _fetch_historical_data  # Reusing the existing helper
from backend.api.schema_models import (
    LOADED_RAW_SCHEMA,
)  # To get table names for historical data
from backend.api.subscription_manager import SubscriptionManager

# Create a new API Router for ZeroMQ-like WebSocket streaming
subscription_router = APIRouter(
    tags=["ZeroMQ-like WebSockets"],
    responses={404: {"description": "Not found"}},
)


# class Connection:
#     """Represents a single active WebSocket connection and its subscriptions."""

#     def __init__(self, websocket: WebSocket, client_id: str):
#         self.websocket: WebSocket = websocket
#         self.client_id: str = client_id
#         self.queue: asyncio.Queue = asyncio.Queue()  # Personal queue for this client
#         self.subscriptions: Set[str] = (
#             set()
#         )  # Set of table_names this client is subscribed to
#         logger.info(f"Connection {self.client_id} initialized.")

#     async def send_json(self, data: Dict[str, Any]):
#         """Sends JSON data over the WebSocket."""
#         await self.websocket.send_json(data)
#         logger.debug(f"Connection {self.client_id}: Sent data over WebSocket.")

#     async def receive_json(self) -> Dict[str, Any]:
#         """Receives JSON data over the WebSocket."""
#         data = await self.websocket.receive_json()
#         logger.debug(f"Connection {self.client_id}: Received data from WebSocket.")
#         return data

#     def subscribe(self, table_name: str):
#         """Subscribes the client to a table."""
#         self.subscriptions.add(table_name)
#         logger.info(f"Connection {self.client_id} subscribed to '{table_name}'.")

#     def unsubscribe(self, table_name: str):
#         """Unsubscribes the client from a table."""
#         self.subscriptions.discard(table_name)
#         logger.info(f"Connection {self.client_id} unsubscribed from '{table_name}'.")

#     @property
#     def is_subscribed(self, table_name: str) -> bool:
#         """Checks if the client is subscribed to a given table."""
#         return table_name in self.subscriptions


# class SubscriptionManager:
#     """Manages all active WebSocket connections and their subscriptions."""

#     def __init__(self):
#         self.active_connections: Dict[str, Connection] = {}  # {client_id: Connection}
#         self.table_subscribers: Dict[str, Set[str]] = (
#             {}
#         )  # {table_name: {client_id, ...}}
#         logger.info("SubscriptionManager initialized.")

#     async def connect(self, websocket: WebSocket) -> Connection:
#         """Handles a new WebSocket connection."""
#         client_id = str(uuid.uuid4())
#         connection = Connection(websocket, client_id)
#         self.active_connections[client_id] = connection
#         logger.info(
#             f"Client {client_id} connected. Total active connections: {len(self.active_connections)}"
#         )
#         return connection

#     async def disconnect(self, client_id: str):
#         """Handles a WebSocket disconnection."""
#         if client_id in self.active_connections:
#             connection = self.active_connections.pop(client_id)
#             # Remove client from all tables they were subscribed to
#             for table_name in connection.subscriptions:
#                 self.table_subscribers.get(table_name, set()).discard(client_id)
#                 if not self.table_subscribers[table_name]:
#                     del self.table_subscribers[table_name]  # Clean up empty sets
#             logger.info(
#                 f"Client {client_id} disconnected. Remaining active connections: {len(self.active_connections)}"
#             )

#     async def subscribe(
#         self,
#         client_id: str,
#         table_name: str,
#         send_historical: bool = False,
#         historical_limit: int = 100,
#     ):
#         """Subscribes a client to a specific table."""
#         if client_id not in self.active_connections:
#             logger.warning(f"Subscribe failed: Client {client_id} not found.")
#             return

#         connection = self.active_connections[client_id]
#         if table_name not in LOADED_RAW_SCHEMA.tables:
#             logger.warning(
#                 f"Client {client_id}: Attempted to subscribe to unknown table '{table_name}'."
#             )
#             await connection.send_json(
#                 {
#                     "type": "error",
#                     "message": f"Table '{table_name}' not found or not defined in schema.",
#                 }
#             )
#             return

#         connection.subscribe(table_name)
#         self.table_subscribers.setdefault(table_name, set()).add(client_id)
#         logger.info(f"Client {client_id} successfully subscribed to '{table_name}'.")

#         # Optionally send historical data upon subscription
#         if send_historical:
#             logger.info(
#                 f"Client {client_id}: Fetching historical data for {table_name} (limit={historical_limit})..."
#             )
#             local_db_pool = (
#                 connection.websocket.app.state.local_db_pool
#             )  # Access pool from app state
#             historical_data_raw = await _fetch_historical_data(
#                 local_db_pool, table_name, historical_limit
#             )

#             serializable_historical_data = []
#             for record in historical_data_raw:
#                 serializable_record = {
#                     key: (
#                         value.isoformat(timespec="milliseconds").replace("+00:00", "Z")
#                         if isinstance(value, datetime.datetime)
#                         else value
#                     )
#                     for key, value in record.items()
#                 }
#                 serializable_historical_data.append(serializable_record)

#             await connection.send_json(
#                 {
#                     "type": "historical",
#                     "table": table_name,
#                     "data": serializable_historical_data,
#                 }
#             )
#             logger.info(
#                 f"Client {client_id}: Sent {len(serializable_historical_data)} historical records for {table_name}."
#             )

#         await connection.send_json(
#             {"type": "status", "table": table_name, "status": "subscribed"}
#         )

#     async def unsubscribe(self, client_id: str, table_name: str):
#         """Unsubscribes a client from a specific table."""
#         if client_id not in self.active_connections:
#             logger.warning(f"Unsubscribe failed: Client {client_id} not found.")
#             return

#         connection = self.active_connections[client_id]
#         connection.unsubscribe(table_name)
#         self.table_subscribers.get(table_name, set()).discard(client_id)
#         if not self.table_subscribers[table_name]:
#             del self.table_subscribers[table_name]  # Clean up empty sets
#         logger.info(
#             f"Client {client_id} successfully unsubscribed from '{table_name}'."
#         )
#         await connection.send_json(
#             {"type": "status", "table": table_name, "status": "unsubscribed"}
#         )

#     async def publish(self, table_name: str, message: Dict[str, Any]):
#         """Publishes a message to all clients subscribed to a specific table."""
#         if table_name in self.table_subscribers:
#             for client_id in list(
#                 self.table_subscribers[table_name]
#             ):  # Iterate over a copy to avoid issues if clients disconnect
#                 connection = self.active_connections.get(client_id)
#                 if connection:
#                     try:
#                         await connection.queue.put(message)
#                         logger.debug(
#                             f"Published message for '{table_name}' to client {client_id}'s queue."
#                         )
#                     except Exception as e:
#                         logger.error(
#                             f"Error publishing to client {client_id} for table '{table_name}': {e}"
#                         )
#                         # Consider removing client if their queue causes consistent errors
#                 else:
#                     logger.warning(
#                         f"Client {client_id} for table '{table_name}' not found in active connections during publish. Cleaning up."
#                     )
#                     self.table_subscribers[table_name].discard(client_id)


# --- WebSocket Endpoint for ZeroMQ-like streaming ---
@subscription_router.websocket("/ws")
async def websocket_zmq_stream(websocket: WebSocket):
    """
    WebSocket endpoint for ZeroMQ-like subscription streaming.
    Clients connect and then send JSON messages to subscribe/unsubscribe.
    """
    await websocket.accept()
    # Ensure subscription_manager is initialized on app.state
    subscription_manager: SubscriptionManager = websocket.app.state.subscription_manager
    connection = await subscription_manager.connect(websocket)
    client_id = connection.client_id
    logger.info(f"New client {client_id} connected to /ws/zmq_stream.")

    send_task = None
    receive_task = None

    try:
        # Task to send messages from the client's queue to the WebSocket
        async def send_to_client_task():
            try:
                while True:
                    message = await connection.queue.get()
                    logger.debug(
                        f"Client {client_id} (send_task): Sending message: {message['type']} for {message.get('table', 'N/A')}"
                    )
                    await connection.send_json(message)
                    connection.queue.task_done()
            except asyncio.CancelledError:
                logger.info(f"Client {client_id} (send_task) cancelled.")
            except WebSocketDisconnect:
                logger.info(
                    f"Client {client_id} (send_task) detected client disconnect."
                )
                raise  # Re-raise to main try-except
            except Exception as e:
                logger.error(f"Client {client_id} (send_task) error: {e}")
                raise

        # Task to receive messages from the client (subscribe/unsubscribe requests)
        async def receive_from_client_task():
            try:
                while True:
                    message = await connection.receive_json()
                    message_type = message.get("type")
                    table_name = message.get("table_name")

                    if message_type == "subscribe" and table_name:
                        send_historical = message.get("send_historical", True)
                        historical_limit = message.get("historical_limit", 100)
                        await subscription_manager.subscribe(
                            client_id, table_name, send_historical, historical_limit
                        )
                    elif message_type == "unsubscribe" and table_name:
                        await subscription_manager.unsubscribe(client_id, table_name)
                    else:
                        logger.warning(
                            f"Client {client_id}: Received unknown or invalid message: {message}"
                        )
                        await connection.send_json(
                            {"type": "error", "message": "Invalid command."}
                        )
            except WebSocketDisconnect:
                logger.info(
                    f"Client {client_id} (receive_task) detected client disconnect."
                )
                raise  # Re-raise to main try-except
            except asyncio.CancelledError:
                logger.info(f"Client {client_id} (receive_task) cancelled.")
            except Exception as e:
                logger.error(f"Client {client_id} (receive_task) error: {e}")
                raise

        send_task = asyncio.create_task(send_to_client_task())
        receive_task = asyncio.create_task(receive_from_client_task())

        # Wait for both tasks to complete (which means one of them raised an exception or was cancelled)
        await asyncio.gather(send_task, receive_task)

    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected from /ws gracefully.")
    except Exception as e:
        logger.error(f"Unhandled error for client {client_id} on /ws: {e}")
    finally:
        if send_task:
            send_task.cancel()
        if receive_task:
            receive_task.cancel()

        # Ensure tasks are awaited to clean up properly
        try:
            if send_task:
                await send_task
            if receive_task:
                await receive_task
        except asyncio.CancelledError:
            pass  # Expected if cancelled

        await subscription_manager.disconnect(client_id)
