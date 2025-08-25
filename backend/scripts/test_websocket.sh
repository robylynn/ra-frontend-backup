#!/bin/bash

# ./backend/scripts/test_websocket.sh
# Tests the WebSocket endpoint for a specific table.

set -euo pipefail

source ../../.env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"

# Using 'user_activity' table for WebSocket test as it's defined in schema.yml
TABLE_NAME="user_activity"
HISTORICAL_LIMIT=1 # Limit for historical data to receive initially

echo "Testing WebSocket endpoint for table: ${TABLE_NAME} (historical_limit=${HISTORICAL_LIMIT})"

# Ensure the table exists and is clean before testing
echo "Ensuring table '${TABLE_NAME}' is clean for WebSocket test..."
(cd .. && python -m utilities.db_manager --action reset --target local --table "${TABLE_NAME}")
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to reset table '${TABLE_NAME}' before WebSocket test."
    exit 1
fi

# ADDED: Explicitly setup the table after resetting it
echo "Setting up table '${TABLE_NAME}' for WebSocket test..."
(cd .. && python -m utilities.db_manager --action setup --target local --table "${TABLE_NAME}")
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to set up table '${TABLE_NAME}' before WebSocket test."
    exit 1
fi

# Execute the Python script to handle the WebSocket interaction
# The Python script will return 0 for success, non-zero for failure
python3 ./ws_test_client.py "${API_BASE_URL}" "${TABLE_NAME}" "${HISTORICAL_LIMIT}"

if [ $? -ne 0 ]; then
    echo "ERROR: WebSocket test failed for table '${TABLE_NAME}'."
    exit 1
else
    echo "SUCCESS: WebSocket test passed for table '${TABLE_NAME}'."
fi
