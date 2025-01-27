#!/usr/bin/env bash
echo "$(dirname "$0")"

cd "$(dirname "$0")"
. ./set_env_vars.sh

# docker compose -f $PROJECT_ROOT/docker-compose.hub.yml up
docker compose -f $PROJECT_ROOT/docker-compose.local.yml up