# ./scripts/ws_test_client.py
import asyncio
import websockets
import httpx
import sys
from datetime import datetime, timezone, timedelta
import json  # Import json module

# Ensure backend root is in path for imports
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.join(current_dir, "..")
sys.path.insert(0, backend_root)

# Loguru configuration for this script
from loguru import logger

logger.remove()
logger.add(
    sys.stderr,
    level="INFO",
    format="{time} | {level} | {module}:{function}:{line} - {message}",
    colorize=True,
)


async def run_websocket_test(api_base_url: str, table_name: str, historical_limit: int):
    websocket_url = f"ws://{api_base_url.replace('http://', '')}/database/ws/data/{table_name}?historical_limit={historical_limit}"
    http_insert_url = f"{api_base_url}/database/insert_data/{table_name}"

    test_user_id_prefix = "ws-test-user-" + datetime.now().strftime(
        "%Y%m%d%H%M%S"
    )  # Unique ID for each test run

    # Define initial data with a specific time for easier comparison
    # Ensure datetime objects are timezone-aware (UTC) and then convert to ISO string with milliseconds precision
    initial_activity_time = datetime.now(timezone.utc).replace(
        microsecond=0
    ) + timedelta(seconds=1)
    initial_activity_time_iso = initial_activity_time.isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")

    initial_data_to_insert = [
        {
            "activity_time": initial_activity_time_iso,
            "user_id": f"{test_user_id_prefix}-1",
            "action": "initial_websocket_test_action",
            "duration_ms": 1000,
        }
    ]

    # Define live data for comparison
    live_activity_time = datetime.now(timezone.utc).replace(microsecond=0) + timedelta(
        seconds=2
    )
    live_activity_time_iso = live_activity_time.isoformat(
        timespec="milliseconds"
    ).replace("+00:00", "Z")

    live_data_to_insert = [
        {
            "activity_time": live_activity_time_iso,
            "user_id": f"{test_user_id_prefix}-2",
            "action": "websocket_test_action",
            "duration_ms": 1234,
        }
    ]

    try:
        # NEW: Insert initial data *before* establishing the WebSocket connection
        logger.info("Inserting initial data via HTTP *before* WebSocket connection...")
        async with httpx.AsyncClient() as client:
            insert_response_initial = await client.post(
                http_insert_url, json=initial_data_to_insert
            )
            insert_response_initial.raise_for_status()  # Raise an exception for HTTP errors
            logger.info(
                f"Initial data inserted via HTTP: {insert_response_initial.json()}"
            )

        async with websockets.connect(websocket_url) as websocket:
            logger.info("WebSocket connected. Receiving historical data...")

            # 1. Receive historical data
            historical_message = await asyncio.wait_for(websocket.recv(), timeout=5)
            historical_json = json.loads(
                historical_message
            )  # Parse JSON string to Python dict

            logger.info(f"Received historical data: {historical_json}")

            assert (
                historical_json["type"] == "historical"
            ), "Expected historical data message type."
            assert isinstance(
                historical_json["data"], list
            ), "Historical data should be a list."

            # Now, we expect to get the pre-inserted data as historical
            assert (
                len(historical_json["data"]) == 1
            ), f"Expected 1 historical record, got {len(historical_json['data'])}"

            # Validate the content of the historical record
            received_historical_record = historical_json["data"][0]
            assert (
                received_historical_record["user_id"]
                == initial_data_to_insert[0]["user_id"]
            )

            # Convert received ISO string back to datetime for robust comparison
            received_historical_time = datetime.fromisoformat(
                received_historical_record["activity_time"].replace("Z", "+00:00")
            )
            expected_historical_time = datetime.fromisoformat(
                initial_data_to_insert[0]["activity_time"].replace("Z", "+00:00")
            )

            # Assert that the received historical time matches the expected, ignoring microseconds beyond milliseconds
            assert (
                abs(
                    (
                        received_historical_time - expected_historical_time
                    ).total_seconds()
                )
                < 0.001
            ), f"Historical activity_time mismatch: Expected {expected_historical_time}, got {received_historical_time}"

            logger.info(
                f"Successfully received {len(historical_json['data'])} historical records."
            )

            # 2. Insert new data to trigger a live WebSocket update
            logger.info(
                "Inserting new data via HTTP to trigger live WebSocket update..."
            )
            async with httpx.AsyncClient() as client:
                insert_response_live = await client.post(
                    http_insert_url, json=live_data_to_insert
                )
                insert_response_live.raise_for_status()  # Raise an exception for HTTP errors
                logger.info(f"Data inserted via HTTP: {insert_response_live.json()}")

            logger.info("Waiting for live data update from WebSocket (timeout 10s)...")
            live_message = await asyncio.wait_for(websocket.recv(), timeout=10)
            live_json = json.loads(live_message)  # Parse JSON string to Python dict

            logger.info(f"Received live data: {live_json}")

            assert live_json["type"] == "live", "Expected live data message type."
            assert "data" in live_json, "Live data message should contain 'data' key."

            received_live_record = live_json["data"]
            expected_live_record = live_data_to_insert[0]

            assert (
                received_live_record["user_id"] == expected_live_record["user_id"]
            ), f"Live data user_id mismatch: Expected {expected_live_record['user_id']}, got {received_live_record['user_id']}"
            assert (
                received_live_record["action"] == expected_live_record["action"]
            ), f"Live data action mismatch: Expected {expected_live_record['action']}, got {received_live_record['action']}"

            # Convert received ISO string back to datetime for robust comparison
            received_live_time = datetime.fromisoformat(
                received_live_record["activity_time"].replace("Z", "+00:00")
            )
            expected_live_time = datetime.fromisoformat(
                expected_live_record["activity_time"].replace("Z", "+00:00")
            )

            # Assert that the received live time matches the expected, ignoring microseconds beyond milliseconds
            assert (
                abs((received_live_time - expected_live_time).total_seconds()) < 0.001
            ), f"Live activity_time mismatch: Expected {expected_live_time}, got {received_live_time}"

            logger.info("Successfully received and validated live data.")

    except websockets.exceptions.ConnectionClosedOK:
        logger.info("WebSocket connection closed as expected.")
    except asyncio.TimeoutError:
        logger.error("WebSocket test timed out waiting for messages.")
        raise AssertionError("WebSocket test timed out.")
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error during data insertion: {e.response.status_code} - {e.response.text}"
        )
        raise AssertionError(f"HTTP error during data insertion: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during WebSocket test: {e}")
        raise AssertionError(f"An unexpected error occurred during WebSocket test: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(
            "Usage: python ws_test_client.py <api_base_url> <table_name> <historical_limit>"
        )
        sys.exit(1)

    api_base_url = sys.argv[1]
    table_name = sys.argv[2]
    historical_limit = int(sys.argv[3])

    try:
        asyncio.run(run_websocket_test(api_base_url, table_name, historical_limit))
    except AssertionError as e:
        logger.error(f"Assertion failed during WebSocket test: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"An error occurred during test execution: {e}")
        sys.exit(1)
