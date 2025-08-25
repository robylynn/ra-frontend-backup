#!/bin/bash

# ./backend/scripts/test_db_query.sh
# Tests the /database/test-query endpoint for actual DB pool functionality.

set -euo pipefail

source ../../.env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"

echo "Testing /status/database/test-query endpoint for actual DB pool functionality..."
DB_QUERY_RESPONSE=$(curl -s "${API_BASE_URL}/status/database/test-query") # CHANGED: Prefix with /status/
echo "DB query response: ${DB_QUERY_RESPONSE}"

if echo "${DB_QUERY_RESPONSE}" | grep -q '"success":true' && \
   echo "${DB_QUERY_RESPONSE}" | grep -q '"message":"Database pool functional."'; then
    echo "SUCCESS: Database query endpoint passed. DB pool is functional!"
else
    echo "ERROR: Database query endpoint failed."
    echo "${DB_QUERY_RESPONSE}"
    exit 1
fi
