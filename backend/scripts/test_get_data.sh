#!/bin/bash

# ./backend/scripts/test_get_data.sh <table_name> [limit] [order_by_column]
# Retrieves data from the specified table.

set -euo pipefail

source ../../.env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"

TABLE_NAME=$1
if [ -z "$TABLE_NAME" ]; then
    echo "Usage: $0 <table_name> [limit] [order_by_column]"
    exit 1
fi

LIMIT=${2:-5} # Default limit to 5 if not provided
ORDER_BY_COLUMN=${3:-time} # Default order_by_column to 'time'

echo "Retrieving data from table: ${TABLE_NAME} (limit=${LIMIT}, order_by=${ORDER_BY_COLUMN})"

GET_RESPONSE=$(curl -s "${API_BASE_URL}/database/get_data/${TABLE_NAME}?limit=${LIMIT}&order_by_column=${ORDER_BY_COLUMN}")

echo "Get response: ${GET_RESPONSE}"

if echo "${GET_RESPONSE}" | grep -q '"success":true'; then
    echo "SUCCESS: Data retrieved from '${TABLE_NAME}'."
else
    echo "ERROR: Failed to retrieve data from '${TABLE_NAME}'."
    echo "${GET_RESPONSE}"
    exit 1
fi
