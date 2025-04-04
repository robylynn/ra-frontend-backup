ARG ROS_DISTRO=humble
ARG PREFIX=

# FROM husarnet/ros:${PREFIX}${ROS_DISTRO}-ros-core
# FROM ros:humble-ros-core
FROM ros:humble-ros-base

SHELL ["/bin/bash", "-c"]

RUN apt update && apt upgrade -y && apt install -y \
        ros-$ROS_DISTRO-rosbridge-server ros-$ROS_DISTRO-tf2-msgs ros-dev-tools && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ["mkdir", "-p", "/home/r2/ros2_ws"]

COPY launch.sh launch.sh

EXPOSE 9090