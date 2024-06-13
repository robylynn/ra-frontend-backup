export USER=r2

# export WIREGUARD_TUNNEL_PORT=51820
# export EXTERNAL_WIREGUARD_TUNNEL_PORT=61820
# export WIREGUARD_UI_PORT=61920
# export DATABASE_UI_PORT=61921
# export NGINX_PROXY_DATABASE_UI_PORT=61922
# export NGINX_PROXY_WIREGUARD_UI_PORT=62920
export MAIN_WORKING_DIRECTORY=/home/$USER/r2
export HOST_DB_STORAGE_PATH=$MAIN_WORKING_DIRECTORY/databases/ra_data

export DOCKER_UID="$(id $USER | sed -nr 's/.*uid=(....)\(.*\).*/\1/p')"
export DOCKER_GID="$(id $USER | sed -nr 's/.*gid=(....)\(.*\).*/\1/p')"