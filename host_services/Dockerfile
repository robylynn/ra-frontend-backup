# FROM python:3.10
FROM ubuntu:22.04

# Variables from docker compose
# ARG APP_WORKDIR
# ARG CONFIG_FILE
# ARG CONFIG_FILE_DIR
# ARG PROJECT_ROOT

ENV CONTAINERIZED=true


# RUN apt-get install -y python3.10

# WORKDIR /${APP_WORKDIR}
WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

# RUN apt-get update
RUN apt-get update && apt-get install -y python3.10 python3-pip
RUN apt-get install -y wireless-tools network-manager iproute2 iw curl
RUN rm -rf /var/lib/apt/lists/*

## Copy over necessary files for building and deployment
COPY host_services ./host_services
COPY common_models ./common_models
# COPY scripts/launch.sh ${APP_WORKDIR}/launch.sh
RUN python3 -m pip install -r ./host_services/requirements.txt

# # Finalize directory setup
# RUN chmod 777 $APP_WORKDIR/launch.sh

EXPOSE ${HOST_SERVICES_PORT}

CMD ["python3", "-m", "host_services"]