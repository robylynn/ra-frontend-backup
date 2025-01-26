#!/usr/bin/env bash

# echo $0
# echo "$(dirname "$0")"
# echo $PWD

cd "$(dirname "$0")"
. ./set_env_vars.sh
# ls ../backend
scripts_dir=$PWD
echo $scripts_dir

# docker compose -f $PROJECT_ROOT/docker-compose.local.yml build ra_frontend ra_backend
# cd cd "$(dirname "$0")"/../dashboard

cd $scripts_dir/../dashboard
# docker buildx build --platform linux/amd64,linux/arm64 --tag robylynn/rac:ra_frontend --push .

cd $scripts_dir/..
docker buildx build -f backend/Dockerfile . --platform linux/amd64,linux/arm64 --tag robylynn/rac:ra_backend --push