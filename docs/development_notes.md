## Roby / Lucas 8/9/24
- plotjuggler multi plot functionality
- database tie in to save actual data from ros
- digital input display
- finish wiring up lucas components
- get nextjs version running on lucas machine
- configuration in database

## API Calls
For the storage of analog input state data, make a request from the ROS side like
```
def analog_in_message_received_callback(self, msg: AnalogIn):
    return
    analog_in_data_object = {
        "time_sec": msg.stamp.sec,
        "time_nsec": msg.stamp.nanosec,
        "values": {
            0: float(msg.values[0]),
            1: float(msg.values[1]),
            2: float(msg.values[2])
        }
    }

    requests.post(
        url='http://127.0.0.1:8000/historian/io_data',
        json=analog_in_data_object
    )
```

For the input point configuration request, we can do
```
def configure_gpio_callback(self, request: ConfigureAnalogIn_Request, response: ConfigureAnalogIn_Response):
    self.get_logger().info('Received request to configure GPIO')
    time.sleep(1.0)
    
    configuration_object = {
        "point_type": request.type,
        "label": request.label,
        "max_electrical_value": request.max_electrical_value,
        "min_electrical_value": request.min_electrical_value,
        "max_measurement_value": request.max_measurement_value,
        "min_measurement_value": request.min_measurement_value,
        "transfer_function_type": request.transfer_function,
        "custom_transfer_function": request.custom_transfer_function,
        "channel": request.channel
    }

    requests.post("http://127.0.0.1:8000/configuration/io/configure_point", json=configuration_object)
    
    response.success = True
    return response
```

TODO
Make new endpoints for ROS JSON only data for database
Fix analog plot
Parse UI configuration on startup to render frontend
