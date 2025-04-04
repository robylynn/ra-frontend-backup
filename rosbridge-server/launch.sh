echo "SOURCING"
source /home/r2/ros2_ws/install/setup.bash
echo $(dpkg -s ros-$ROS_DISTRO-rosbridge-server | grep 'Version' | sed -r 's/Version:\s([0-9]+.[0-9]+.[0-9]+).*/\1/g') >> /version.txt
ros2 run rosbridge_server rosbridge_websocket