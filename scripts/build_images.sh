#!/usr/bin/env bash

cd "$(dirname "$0")"
. ./set_env_vars.sh

scripts_dir=$PWD

cd $scripts_dir/../dashboard
docker buildx build --build-arg APP_WORKDIR=$APP_WORKDIR --platform linux/amd64,linux/arm64 --tag robylynn/rac:ra_frontend --push .

cd $scripts_dir/..
docker buildx build -f backend/Dockerfile .  --build-arg APP_WORKDIR=$APP_WORKDIR --build-arg PROJECT_ROOT=$PROJECT_ROOT --platform linux/amd64,linux/arm64 --tag robylynn/rac:ra_backend --push