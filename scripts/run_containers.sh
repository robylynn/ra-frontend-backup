#!/usr/bin/env bash
echo "$(dirname "$0")"

cd "$(dirname "$0")"
. ./set_env_vars.sh

# containers_to_run=""

# while [ True ]; do
# if [ "$1" = "--local" ]; then
#     compose_file="docker-compose.local.yml"
#     break
#     # shift 1
# elif [ "$1" = "--hub" ]; then
#     containers_to_run+=" carbonator_backend"
#     compose_file="docker-compose.hub.yml"
#     shift 1
# elif [ "$1" = "--mongo" -o "$1" = "-d" ]; then
#     containers_to_run+=" mongo"
#     shift 1
# elif [ "$1" = "--mqtt" -o "$1" = "-m" ]; then
#     containers_to_run+=" mosquitto"
#     shift 1
# elif [ "$1" = "--database_ui" -o "$1" = "-ui" ]; then
#     containers_to_run+=" mongo_ui"
#     shift 1
# elif [ "$1" = "--all" -o "$1" = "-a" ]; then
#     containers_to_run="carbonator_frontend carbonator_backend mongo mosquitto mongo_ui"
#     break
# elif [ "$1" = "--help" -o "$1" = "-h" ]; then
#     show_help
#     exit
# else
#     break
# fi
# done

docker compose -f $PROJECT_ROOT/docker-compose.local.yml up