FROM python:3.10
# FROM ubuntu:22.04

# Variables from docker compose
ARG APP_WORKDIR
# ARG CONFIG_FILE
# ARG CONFIG_FILE_DIR
# ARG PROJECT_ROOT

RUN apt-get update
RUN apt-get install -y wireless-tools network-manager iproute2
# RUN apt-get install -y python3.10

WORKDIR /${APP_WORKDIR}

## Copy over necessary files for building and deployment
COPY host_services ${APP_WORKDIR}/host_services
COPY common_models /${APP_WORKDIR}/common_models
# COPY scripts/launch.sh ${APP_WORKDIR}/launch.sh
RUN python3 -m pip install -r ${APP_WORKDIR}/host_services/requirements.txt

# # Finalize directory setup
# RUN chmod 777 $APP_WORKDIR/launch.sh

EXPOSE 8000

CMD ["python", "-m", "host_services"]