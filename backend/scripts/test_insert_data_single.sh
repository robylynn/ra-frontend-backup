#!/bin/bash

# ./backend/scripts/test_insert_data_single.sh <table_name>
# Inserts a single data point into the specified table.

set -euo pipefail

source ../../.env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"

TABLE_NAME=$1
if [ -z "$TABLE_NAME" ]; then
    echo "Usage: $0 <table_name>"
    exit 1
fi

echo "Inserting single data point into table: ${TABLE_NAME}"

# Dynamic data generation based on table (simplified for example)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
DEVICE_ID="test-device-$(uuidgen | head -c 8)"
TEMPERATURE=$(echo "scale=2; 20 + (RANDOM % 100) / 10" | bc) # 20.0 to 29.9
HUMIDITY=$(echo "scale=2; 50 + (RANDOM % 50) / 10" | bc)   # 50.0 to 54.9

case "$TABLE_NAME" in
    "sensor_data")
        DATA_PAYLOAD='[{
            "time": "'"${TIMESTAMP}"'",
            "device_id": "'"${DEVICE_ID}"'",
            "temperature": '"${TEMPERATURE}"',
            "humidity": '"${HUMIDITY}"'
        }]'
        ;;
    "project_metrics")
        DATA_PAYLOAD='[{
            "timestamp": "'"${TIMESTAMP}"'",
            "project_name": "project-X",
            "value": 100.5,
            "status": "in_progress"
        }]'
        ;;
    "user_activity")
        DATA_PAYLOAD='[{
            "activity_time": "'"${TIMESTAMP}"'",
            "user_id": "user_alpha",
            "action": "view_dashboard",
            "duration_ms": 1500
        }]'
        ;;
    *)
        echo "WARNING: No predefined data payload for table '${TABLE_NAME}'. Using a generic payload if applicable."
        DATA_PAYLOAD='[{"time": "'"${TIMESTAMP}"'", "data": "generic_data"}]'
        ;;
esac

INSERT_RESPONSE=$(curl -s -X POST \
  "${API_BASE_URL}/database/insert_data/${TABLE_NAME}" \
  -H 'Content-Type: application/json' \
  -d "${DATA_PAYLOAD}")

echo "Insert response: ${INSERT_RESPONSE}"

if echo "${INSERT_RESPONSE}" | grep -q '"success":true'; then
    echo "SUCCESS: Single data point inserted into '${TABLE_NAME}'."
else
    echo "ERROR: Failed to insert single data point into '${TABLE_NAME}'."
    echo "${INSERT_RESPONSE}"
    exit 1
fi
