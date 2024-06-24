import secrets, time, asyncio

from fastapi import WebSocket, APIRouter, Body
from typing import List
from loguru import logger

import system_initializer as initializer

from auth.models import UserLoginSchema
from auth.jwt_handler import signJWT
from auth.jwt_bearer import JWTBearer
from api.models import (
    AuthenticationResponse,
    APIResponse,
    IOPointType,
    FrontendConfiguration,
    FrontendChartConfiguration,
    FrontendIOPointConfiguration,
    # TransmittedFrontendConfiguration,
    FrontendChartTraceConfiguration,
)
# from config.models import (
#     NetworkDevice
# )
from ra_hardware_interface.models import (
    IOPort
)

auth_router=APIRouter(
    tags=[
        "User"
    ]
)

state_router=APIRouter(
    tags=[
        "Status"
    ]
)

ui_router = APIRouter(
    tags=[
        "User Interface"
    ]
)

streaming_router = APIRouter(
    tags=[
        "Data Streams"
    ]
)

config_router = APIRouter(
    tags=[
        "Configuration"
    ]
)

def check_user(data: UserLoginSchema):
    return True
    # for user in system_initializer.system_controller.configuration.frontend.users:
    #     if user.username == data.username and user.password == data.password:
    #         return True
    # return False

@auth_router.post("/login", tags=["user"])
def user_login(user: UserLoginSchema = Body(default=None)) -> AuthenticationResponse:
    if check_user(user):
        # logger.info(f"Logging in user {user.username}")
        return AuthenticationResponse(
            authenticated=True,
            signed_token=signJWT(
                user.username,
                authenticated=True,
                # secret=system_initializer.carbonator_frontend._jwt_secret_key,
                secret=secrets.token_urlsafe(32),
                algorithm="HS256"
            )
        )
        
    else:
        # logger.info(f"Login failed for user {user.username}")
        return AuthenticationResponse(
            authenticated=False,
            signed_token=""
        )

@state_router.get("/heartbeat")
async def heartbeat() -> APIResponse:
    return APIResponse(error=False, data=f"ACK")

# @state_router.get("/clients")
# def get_wireguard_clients() -> APIResponse:
#     output = subprocess.Popen(shlex.split("docker exec -it wireguard wg"), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#     out = [l for l in output.stdout]
#     err = [l for l in output.stderr]

#     IPs = []
#     ip_matcher = re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")

#     for line in out:
#         ip =  re.findall(ip_matcher, line.decode())
#         if len(ip) > 0:
#             IPs.append(ip[0])
    
#     connected_devices: List[NetworkDevice] = []
#     for ip in IPs:
#         for device in initializer.telemetry_configuration.devices:
#             if device.IP == ip:
#                 connected_devices.append(device.dump_json())

#     if output.returncode == 1:
#         # Error
#         return APIResponse(error=True, data=err)
#     else:
#         return APIResponse(error=False, data=connected_devices)

@ui_router.get("/configuration")
async def get_ui_configuration(client_id: int = None) -> APIResponse:
    
    if client_id == None or int(client_id) == -1:
        client_id = initializer.ra_frontend.add_client()

    ui_configuration = FrontendConfiguration(
        client_id=client_id,
        charts=[
            FrontendChartConfiguration(
                chart_id="chart_1",
                width_px=400,
                height_px=300,
                max_length=200,
                title="cahrt1",
                x_data_value_name="time",
                y_axis_decimal_places=1,
                trace_configuration=[
                    FrontendChartTraceConfiguration(
                        color="red",
                        label="output",
                        # y_component_name="component1",
                        y_parameter_name="parameter1"
                    )
                ]


            )
        ],
        io_points=[
            FrontendIOPointConfiguration(
                point_index=0,
                point_type=IOPointType.DIGITAL_INPUT
            ),
            FrontendIOPointConfiguration(
                point_index=1,
                point_type=IOPointType.DIGITAL_INPUT
            ),
            FrontendIOPointConfiguration(
                point_index=2,
                point_type=IOPointType.DIGITAL_OUTPUT
            ),
            FrontendIOPointConfiguration(
                point_index=3,
                point_type=IOPointType.DIGITAL_OUTPUT
            ),
            FrontendIOPointConfiguration(
                point_index=4,
                point_type=IOPointType.ANALOG_VOLTAGE_OUTPUT
            ),
            FrontendIOPointConfiguration(
                point_index=5,
                point_type=IOPointType.ANALOG_VOLTAGE_OUTPUT
            ),
            FrontendIOPointConfiguration(
                point_index=6,
                point_type=IOPointType.ANALOG_VOLTAGE_INPUT
            ),
            FrontendIOPointConfiguration(
                point_index=7,
                point_type=IOPointType.ANALOG_VOLTAGE_INPUT
            )
        ]
    )
    
    # ui_configuration = TransmittedFrontendConfiguration(
    #     client_id=client_id,
    #     charts=[
    #         FrontendChartConfiguration(
    #             width_px=chart.width_px,
    #             height_px=chart.height_px,
    #             max_length=chart.max_length if chart.max_length is not None else system_initializer.system_configuration.frontend.default_maximum_chart_length,
    #             chart_id=chart.chart_id,
    #             title=chart.title,
    #             x_data_value_name=chart.x_data_value_name,
    #             y_axis_decimal_places=chart.y_axis_decimal_places,
    #             trace_configuration=[
    #                 FrontendChartTraceConfiguration(
    #                     color=trace.color,
    #                     label=trace.y_data_value_name,
    #                     y_component_name=trace.y_data_value_component_name,
    #                     y_parameter_name=trace.y_data_value_attribute_name
    #                 )
    #                 for trace in chart.traces
    #             ]
    #         )
    #         for chart in system_initializer.system_configuration.frontend.charts
    #     ],
    #     gauges=[
    #         TransmittedGaugeStreamConfiguration(
    #             gauge_id=gauge.gauge_id,
    #             gauge_text=gauge.gauge_text,
    #             gauge_minimum=gauge.gauge_minimum,
    #             gauge_maximum=gauge.gauge_maximum,
    #             gauge_warning_threshold=gauge.gauge_warning_threshold,
    #             gauge_danger_threshold=gauge.gauge_danger_threshold,
    #             gauge_colors_reversed=gauge.gauge_colors_reversed,
    #             data_component_name=gauge.data_value_component_name,
    #             data_parameter_name=gauge.data_value_attribute_name
    #         )
    #         for gauge in system_initializer.system_configuration.frontend.gauges
    #     ],
    #     io_modules=[
    #         FrontendIOModuleConfiguration(
    #             module_name=module.name,
    #             module_index=module.module_index,
    #             io_points=[
    #                 FrontendIOChannelConfiguration(
    #                     channel_index=index,
    #                     channel_type=channel
    #                 )
    #                 for index, channel in enumerate(module.channel_type_order)
    #             ]
    #             # channel_type_order=module.channel_type_order
    #         )
    #         for module in system_initializer.system_controller.plc.io_modules
    #     ],
    #     component_configuration=system_initializer.system_configuration.frontend.component_configuration,
    #     hardware_configuration={
    #         component_name: FrontendHardwareComponentConfiguration(
    #             hardware_component=component,
    #             name=component_name
    #         ) for component_name, component in system_initializer.system_controller.system_components.items()
    #     }
    # )

    return APIResponse(
        error=False,
        data=ui_configuration.serialize()
    )

@streaming_router.get("/io_data")
def get_io_data_points(number_of_points: int) -> APIResponse:
    points = initializer.ra_database.get_io_data_points(number_of_points=number_of_points, timeout=1)
    return APIResponse(
        error=False,
        data=[p.serialize_to_dict() for p in points]
    )

@streaming_router.get("/messages")
def get_io_data_points(number_of_messages: int) -> APIResponse:
    messages = initializer.ra_database.get_messages(number_of_messages=number_of_messages)
    return APIResponse(
        error=False,
        data=[m.serialize_to_dict() for m in messages]
    )

@config_router.post("/io/configure_point")
def configure_io_point(port: str, point_type: str, name: str, index: int) -> APIResponse:
    try:
        io_port: IOPort = getattr(initializer.ra_interface.io_system, port.lower())
        io_port.add_point(
            point_type=getattr(IOPointType, point_type.upper()),
            name=name,
            index=int(index)
        )
        # initializer.ra_interface.io_system.digital_outputs.add_point(
        #     point_type=IOPointType.DIGITAL_OUTPUT,
        #     name="dio_1",
        #     index=1,
        # )
    except Exception as e:
        error_str = f"Error adding \"{name}\" IO point {index} with type {point_type.upper()} to port {port}: {e}"
        logger.error(error_str)
        return APIResponse(
            error=True,
            data=error_str
        )

    success_str = f"Added \"{name}\" IO point {index} with type {point_type.upper()} to port {port}"
    logger.success(success_str)
    return APIResponse(
        error=False,
        data=success_str
    )

@streaming_router.websocket("/socket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # with websocket:
    logger.info(f"Websocket connected")
    while True:
        #z = await websocket.receive_text()
        try:
            logger.info(f"Websocket streaming")
            await websocket.send_json({'message': 'test_message'})
            # await websocket.send_json({'message': 'test_message'})
            await asyncio.sleep(1)
            #z = await websocket.receive_text()
            
        except Exception as e:
            logger.error(f"Websocket error: {e}")
            break
            # if websocket.
        # data = await websocket.receive_text()
        # await websocket.send_text(f"Message text was: {data}")