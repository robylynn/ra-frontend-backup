# ./ros_stack_simulator.py
import asyncio
import httpx
import websockets
import sys
import os
import json
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from loguru import logger

# --- Loguru Configuration (Consistent with FastAPI app) ---
logger.remove()  # Remove default handler
logger.add(
    sys.stderr,
    level="INFO",
    format="{time} | {level} | {module}:{function}:{line} - {message}",
    colorize=True,
)

# --- Configuration ---
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000")
SIMULATION_TABLE = os.getenv(
    "SIMULATION_TABLE", "user_activity"
)  # Default table for simulation
INSERT_INTERVAL_SECONDS = int(os.getenv("INSERT_INTERVAL_SECONDS", 5))
SIMULATION_DURATION_SECONDS = int(
    os.getenv("SIMULATION_DURATION_SECONDS", 60)
)  # How long the simulation runs


async def insert_batch_data(
    client: httpx.AsyncClient, table_name: str, num_records: int = 1
) -> bool:
    """
    Generates a batch of dummy data and sends it to the /database/insert_data endpoint.
    Adjusts data generation based on the table name.
    """
    data_to_insert: List[Dict[str, Any]] = []
    current_time = datetime.now(timezone.utc).replace(
        microsecond=0
    )  # Millisecond precision for consistency

    for i in range(num_records):
        record: Dict[str, Any] = {}
        if table_name == "user_activity":
            record = {
                "activity_time": (current_time + timedelta(milliseconds=i))
                .isoformat(timespec="milliseconds")
                .replace("+00:00", "Z"),
                "user_id": f"sim_user_{random.randint(1, 100)}",
                "action": random.choice(
                    ["login", "logout", "view_page", "click_button", "scroll"]
                ),
                "duration_ms": random.randint(50, 5000),
            }
        elif table_name == "sensor_data":
            record = {
                "time": (current_time + timedelta(milliseconds=i))
                .isoformat(timespec="milliseconds")
                .replace("+00:00", "Z"),
                "device_id": f"sensor_{random.randint(1, 10)}",
                "temperature": round(random.uniform(15.0, 30.0), 2),
                "humidity": round(random.uniform(40.0, 90.0), 2),
            }
        elif table_name == "project_metrics":
            record = {
                "timestamp": (current_time + timedelta(milliseconds=i))
                .isoformat(timespec="milliseconds")
                .replace("+00:00", "Z"),
                "project_name": f"project_{random.randint(1, 5)}",
                "value": round(random.uniform(0.1, 100.0), 3),
                "status": random.choice(["success", "failure", "pending", "running"]),
            }
        else:
            logger.warning(
                f"Unknown table '{table_name}'. Cannot generate specific data. Skipping insert."
            )
            return False
        data_to_insert.append(record)

    try:
        response = await client.post(
            f"/database/insert_data/{table_name}", json=data_to_insert
        )
        response.raise_for_status()
        logger.info(
            f"Successfully inserted {len(data_to_insert)} records into '{table_name}'. Status: {response.status_code}"
        )
        return True
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error inserting data into '{table_name}': {e.response.status_code} - {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Network error inserting data into '{table_name}': {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during data insertion: {e}")
    return False


async def get_latest_data(client: httpx.AsyncClient, table_name: str, limit: int = 5):
    """
    Retrieves the latest data from the /database/get_data endpoint.
    """
    try:
        response = await client.get(f"/database/get_data/{table_name}?limit={limit}")
        response.raise_for_status()
        data = response.json()
        if data["success"]:
            logger.info(
                f"Retrieved {len(data['data'])} latest records from '{table_name}':"
            )
            for record in data["data"]:
                logger.info(f"  {record}")
        else:
            logger.warning(
                f"Failed to retrieve data from '{table_name}': {data['message']}"
            )
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error getting data from '{table_name}': {e.response.status_code} - {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Network error getting data from '{table_name}': {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during data retrieval: {e}")


async def stream_data_via_websocket(
    api_base_url: str, table_name: str, historical_limit: int = 10
):
    """
    Connects to the WebSocket endpoint and continuously streams data.
    """
    websocket_url = f"ws://{api_base_url.replace('http://', '')}/database/ws/data/{table_name}?historical_limit={historical_limit}"
    logger.info(f"Connecting to WebSocket: {websocket_url}")

    try:
        async with websockets.connect(websocket_url) as websocket:
            logger.info("WebSocket connected. Receiving historical data...")

            # Receive historical data
            historical_message = await websocket.recv()
            historical_json = json.loads(historical_message)
            logger.info(
                f"Received historical data ({len(historical_json.get('data', []))} records): {historical_json['data']}"
            )

            logger.info("Now streaming live data from WebSocket...")
            while True:
                live_message = await websocket.recv()
                live_json = json.loads(live_message)
                logger.info(f"Received live data: {live_json}")
    except websockets.exceptions.ConnectionClosedOK:
        logger.info("WebSocket connection closed gracefully.")
    except websockets.exceptions.ConnectionClosedError as e:
        logger.error(
            f"WebSocket connection closed with error: code={e.code}, reason='{e.reason}'"
        )
    except ConnectionRefusedError:
        logger.error(
            f"WebSocket connection refused. Is the FastAPI server running at {api_base_url}?"
        )
    except Exception as e:
        logger.error(f"An unexpected error occurred during WebSocket streaming: {e}")


async def simulate_ros_stack(api_base_url: str, table_name: str):
    """
    Simulates a ROS stack by periodically inserting data, fetching data,
    and streaming data via WebSocket.
    """
    logger.info(
        f"Starting ROS stack simulation for table '{table_name}' for {SIMULATION_DURATION_SECONDS} seconds..."
    )
    logger.info(f"API Base URL: {api_base_url}")
    logger.info(f"Insert Interval: {INSERT_INTERVAL_SECONDS} seconds")

    async with httpx.AsyncClient(base_url=api_base_url) as http_client:
        # Start WebSocket streaming in a background task
        websocket_task = asyncio.create_task(
            stream_data_via_websocket(api_base_url, table_name)
        )

        start_time = asyncio.get_event_loop().time()
        while (
            asyncio.get_event_loop().time() - start_time < SIMULATION_DURATION_SECONDS
        ):
            await insert_batch_data(http_client, table_name)
            await get_latest_data(http_client, table_name)
            await asyncio.sleep(INSERT_INTERVAL_SECONDS)

        logger.info("Simulation duration reached. Stopping HTTP operations.")
        websocket_task.cancel()  # Cancel the WebSocket task
        try:
            await websocket_task
        except asyncio.CancelledError:
            logger.info("WebSocket streaming task cancelled.")

    logger.info("ROS stack simulation finished.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Allow overriding SIMULATION_TABLE from command line for convenience
        SIMULATION_TABLE = sys.argv[1]

    logger.info(
        f"Running simulation with API_BASE_URL={API_BASE_URL}, SIMULATION_TABLE={SIMULATION_TABLE}"
    )

    # Run the simulation
    try:
        asyncio.run(simulate_ros_stack(API_BASE_URL, SIMULATION_TABLE))
    except KeyboardInterrupt:
        logger.info("Simulation interrupted by user.")
    except Exception as e:
        logger.error(f"Simulation failed due to an unexpected error: {e}")
