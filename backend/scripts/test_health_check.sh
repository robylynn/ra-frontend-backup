#!/bin/bash

# ./backend/scripts/test_health_check.sh
# Tests the main health check endpoint of the FastAPI application.

set -euo pipefail

source ../../.env

API_PORT=${API_PORT:-5000}
API_BASE_URL="http://localhost:${API_PORT}"

echo "Testing /status/ endpoint for health check and DB pool status..."
HEALTH_RESPONSE=$(curl -s "${API_BASE_URL}/status/") # CHANGED: Prefix with /status/
echo "Health check response: ${HEALTH_RESPONSE}"

if echo "${HEALTH_RESPONSE}" | grep -q '"success":true' && \
   echo "${HEALTH_RESPONSE}" | grep -q '"db_pool_initialized":true'; then
    echo "SUCCESS: Health check passed and DB pool reported as initialized."
else
    echo "ERROR: Health check failed or DB pool not initialized."
    echo "${HEALTH_RESPONSE}"
    exit 1
fi
