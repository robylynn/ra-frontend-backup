import secrets, os, subprocess, shlex, re, warnings

from fastapi import WebSocket, APIRouter, Body
from typing import List

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
from config.models import (
    NetworkDevice
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

@state_router.get("/clients")
def get_wireguard_clients() -> APIResponse:
    output = subprocess.Popen(shlex.split("docker exec -it wireguard wg"), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = [l for l in output.stdout]
    err = [l for l in output.stderr]

    IPs = []
    ip_matcher = re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")

    for line in out:
        ip =  re.findall(ip_matcher, line.decode())
        if len(ip) > 0:
            IPs.append(ip[0])
    
    connected_devices: List[NetworkDevice] = []
    for ip in IPs:
        for device in initializer.telemetry_configuration.devices:
            if device.IP == ip:
                connected_devices.append(device.dump_json())

    if output.returncode == 1:
        # Error
        return APIResponse(error=True, data=err)
    else:
        return APIResponse(error=False, data=connected_devices)

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