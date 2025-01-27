#/bin/bash

export USER=$(whoami)

export MAIN_WORKING_DIRECTORY=/home/$USER/r2
export HOST_DB_STORAGE_PATH=$MAIN_WORKING_DIRECTORY/databases/ra_data
export PROJECT_ROOT=/home/$USER/r2/ra-frontend

## CONTAINER SPECIFIC PATHS
export APP_WORKDIR=/app
export CONFIG_FILE_DIR=config
export CONFIG_FILE=system_configuration.yaml
export HOST_HOSTNAME=$(hostname)

export DOCKER_UID="$(id $USER | sed -nr 's/.*uid=(....)\(.*\).*/\1/p')"
export DOCKER_GID="$(id $USER | sed -nr 's/.*gid=(....)\(.*\).*/\1/p')"


echo "Finished setting up env variables"