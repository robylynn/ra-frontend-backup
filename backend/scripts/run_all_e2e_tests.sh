#!/bin/bash

# ./backend/scripts/run_all_e2e_tests.sh
# This script orchestrates the end-to-end API tests assuming:
# 1. PostgreSQL (timescaledb) is running via Docker Compose.
# 2. The FastAPI application is running directly on the host.
# 3. The current working directory for the script is 'backend/scripts/'.

set -euo pipefail # Exit immediately if a command exits with a non-zero status.

# Source the root .env file to load environment variables into the shell
source ../../.env # Go up two levels to the project root for .env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"
MAX_RETRIES=15
RETRY_INTERVAL=5 # seconds
MAX_DB_POOL_HEALTH_RETRIES=10
DB_POOL_HEALTH_RETRY_INTERVAL=3 # seconds

echo "--- Starting End-to-End API Tests (Host-Run FastAPI) ---"

# --- 1. Ensure TimescaleDB is running via Docker Compose ---
echo "Ensuring TimescaleDB is running via Docker Compose..."
# Use -f ../../docker-compose.yml to reference the file in the project root
docker compose -f ../../docker-compose.yml --env-file ../../.env up -d timescaledb 
if [ $? -ne 0 ]; then
    echo "Error: Docker Compose failed to start timescaledb. Ensure Docker is running and docker-compose.yml is correct."
    exit 1
fi
echo "TimescaleDB is up and running."

# --- 2. Wait for FastAPI API to be generally healthy and DB pool initialized ---
echo "Waiting for FastAPI API to be generally healthy AND DB pool initialized at ${API_BASE_URL}/status/..."
echo "Please ensure the FastAPI application is already running (e.g., launched from VS Code or 'uvicorn api.__main__:backend_api')."

HEALTHY=false
for i in $(seq 1 $MAX_DB_POOL_HEALTH_RETRIES); do
    HEALTH_RESPONSE=$(curl -s "${API_BASE_URL}/status/") # CHANGED: Prefix with /status/
    # Check for both success and db_pool_initialized:true
    if echo "$HEALTH_RESPONSE" | grep -q '"success":true' && echo "$HEALTH_RESPONSE" | grep -q '"db_pool_initialized":true'; then
        echo "FastAPI API is healthy and DB pool initialized!"
        HEALTHY=true
        break
    else
        echo "Attempt $i/$MAX_DB_POOL_HEALTH_RETRIES: API not fully healthy or DB pool not initialized. Waiting ${DB_POOL_HEALTH_RETRY_INTERVAL}s..."
        echo "Current Health Response: ${HEALTH_RESPONSE}"
        sleep $DB_POOL_HEALTH_RETRY_INTERVAL
    fi
done

if [ "$HEALTHY" = false ]; then
    echo "CRITICAL ERROR: API did not report DB pool initialized. Exiting."
    exit 1
fi

# --- 3. Run db_manager to ensure tables exist ---
echo "Ensuring database tables are set up using utilities.db_manager..."
# Run db_manager directly from the host, assuming Python environment is active
# Use python -m utilities.db_manager from the backend root
(cd .. && python -m utilities.db_manager --action auto_setup --drop-local-existing) # Execute from backend dir
if [ $? -ne 0 ]; then
    echo "Error: utilities.db_manager failed to set up tables."
    exit 1
fi
echo "Database tables ensured."

# --- 4. Call individual test scripts ---
echo "--- Running individual test scripts ---"

# Run health check
echo "Running health check test..."
./test_health_check.sh
if [ $? -ne 0 ]; then exit 1; fi

# Run database query test
echo "Running database query test..."
./test_db_query.sh
if [ $? -ne 0 ]; then exit 1; fi

# Run insert single data test (example: sensor_data)
echo "Running insert single data test for sensor_data..."
./test_insert_data_single.sh sensor_data
if [ $? -ne 0 ]; then exit 1; fi

# Run insert batch data test (example: project_metrics)
echo "Running insert batch data test for project_metrics..."
./test_insert_data_batch.sh project_metrics
if [ $? -ne 0 ]; then exit 1; fi

# Run get data test (example: sensor_data)
echo "Running get data test for sensor_data..."
./test_get_data.sh sensor_data
if [ $? -ne 0 ]; then exit 1; fi

# NEW: Run WebSocket test (example: user_activity)
echo "Running WebSocket test for user_activity..."
./test_websocket.sh
if [ $? -ne 0 ]; then exit 1; fi

echo "--- All End-to-End API Tests Passed Successfully! ---"

# --- Optional: Bring down TimescaleDB service after tests ---
# echo "Bringing down TimescaleDB service..."
# docker compose -f ../../docker-compose.yml --env-file ../../.env down timescaledb
