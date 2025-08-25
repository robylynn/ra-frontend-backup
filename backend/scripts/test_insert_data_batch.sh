#!/bin/bash

# ./backend/scripts/test_insert_data_batch.sh <table_name>
# Inserts a batch of 3 data points into the specified table.

set -euo pipefail

source ../../.env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"

TABLE_NAME=$1
if [ -z "$TABLE_NAME" ]; then
    echo "Usage: $0 <table_name>"
    exit 1
fi

echo "Inserting batch of data points into table: ${TABLE_NAME}"

BATCH_DATA_PAYLOAD="["
for i in {1..3}; do
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z" -d "+${i} minutes")
    DEVICE_ID="batch-device-$(uuidgen | head -c 8)"
    TEMPERATURE=$(echo "scale=2; 25 + (RANDOM % 50) / 10" | bc)
    HUMIDITY=$(echo "scale=2; 60 + (RANDOM % 30) / 10" | bc)

    case "$TABLE_NAME" in
        "sensor_data")
            ITEM='{
                "time": "'"${TIMESTAMP}"'",
                "device_id": "'"${DEVICE_ID}"'",
                "temperature": '"${TEMPERATURE}"',
                "humidity": '"${HUMIDITY}"'
            }'
            ;;
        "project_metrics")
            ITEM='{
                "timestamp": "'"${TIMESTAMP}"'",
                "project_name": "project-Y-batch",
                "value": '"$(echo "scale=2; 200 + (RANDOM % 1000) / 10" | bc)"',
                "status": "completed"
            }'
            ;;
        "user_activity")
            ITEM='{
                "activity_time": "'"${TIMESTAMP}"'",
                "user_id": "user_batch_'"$i"'",
                "action": "report_bug",
                "duration_ms": '"$(echo "$((1000 + RANDOM % 5000))")"'
            }'
            ;;
        *)
            echo "WARNING: No predefined data payload for table '${TABLE_NAME}'. Using a generic payload if applicable."
            ITEM='{"time": "'"${TIMESTAMP}"'", "data": "generic_batch_'"$i"'"}'
            ;;
    esac
    BATCH_DATA_PAYLOAD+="${ITEM}"
    if [ "$i" -lt 3 ]; then
        BATCH_DATA_PAYLOAD+=","
    fi
done
BATCH_DATA_PAYLOAD+="]"

INSERT_RESPONSE=$(curl -s -X POST \
  "${API_BASE_URL}/database/insert_data/${TABLE_NAME}" \
  -H 'Content-Type: application/json' \
  -d "${BATCH_DATA_PAYLOAD}")

echo "Insert batch response: ${INSERT_RESPONSE}"

if echo "${INSERT_RESPONSE}" | grep -q '"success":true'; then
    echo "SUCCESS: Batch data inserted into '${TABLE_NAME}'."
else
    echo "ERROR: Failed to insert batch data into '${TABLE_NAME}'."
    echo "${INSERT_RESPONSE}"
    exit 1
fi
