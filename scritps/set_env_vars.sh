export USER=r2

export MAIN_WORKING_DIRECTORY=/home/$USER/r2
export HOST_DB_STORAGE_PATH=$MAIN_WORKING_DIRECTORY/databases/ra_data

export DOCKER_UID="$(id $USER | sed -nr 's/.*uid=(....)\(.*\).*/\1/p')"
export DOCKER_GID="$(id $USER | sed -nr 's/.*gid=(....)\(.*\).*/\1/p')"