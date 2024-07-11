# RA Backend Routers
# Developed by R2 Labs

import secrets, time, asyncio, random

from fastapi import WebSocket, APIRouter, Body
from typing import (
    List,
    Dict
)
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
    FrontendChartTraceConfiguration,
    IOConfigurationRequestData
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

historian_router = APIRouter(
    tags=[
        "Data Streams"
    ]
)

config_router = APIRouter(
    tags=[
        "Configuration"
    ]
)

###############################################################################
############################### AUTHENTICATION ################################
###############################################################################

def check_user(data: UserLoginSchema):
    # return True
    # for user in system_initializer.system_controller.configuration.frontend.users:
    #     if user.username == data.username and user.password == data.password:
    #         return True
    # return False
    if data.username in ['r2', 'roby', 'lucas'] and data.password == 'password':
        return True
    
    return False

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

###############################################################################
################################ SYSTEM STATE #################################
###############################################################################

@state_router.get("/heartbeat")
async def heartbeat() -> APIResponse:
    return APIResponse(error=False, data=f"ACK")

###############################################################################
########################### FRONTEND CONFIGURATION ############################
###############################################################################

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

    return APIResponse(
        error=False,
        data=ui_configuration.serialize()
    )

###############################################################################
############################## DATABASE REQUESTS ##############################
###############################################################################

@historian_router.get("/io_data")
def get_io_data_points(number_of_points: int) -> APIResponse:
    points = initializer.ra_database.get_io_state(number_of_points=number_of_points, timeout=1)
    return APIResponse(
        error=False,
        data=[p.serialize_to_dict() for p in points]
    )

@historian_router.get("/messages")
def get_messages(number_of_messages: int) -> APIResponse:
    messages = initializer.ra_database.get_messages(number_of_messages=number_of_messages, timeout=1)
    return APIResponse(
        error=False,
        data=[m.serialize_to_dict() for m in messages]
    )

@historian_router.get("/sensor_data")
def get_messages(number_of_data_points: int) -> APIResponse:
    data = initializer.ra_database.get_sensor_data(number_of_data_points=number_of_data_points, timeout=1)
    return APIResponse(
        error=False,
        data=[d.serialize_to_dict() for d in data]
    )

###############################################################################
################################ CONFIGURATION ################################
###############################################################################

@config_router.post("/io/configure_point")
def configure_io_point(config: IOConfigurationRequestData) -> APIResponse:
    logger.info(f"Got configuration request: {config}")

    return APIResponse(
        error=False,
        data=f"Got configuration request: {config}"
    )

###############################################################################
################################## STREAMING ##################################
###############################################################################

@historian_router.websocket("/socket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = initializer.ra_frontend.add_websocket_client()
    logger.info(f"Websocket client {client_id} connected")
    while True:
        
        try:
            logger.info(f"Websocket streaming to client {client_id}")
            
            await asyncio.sleep(1)
            await websocket.send_json({'id': client_id, 'message': 'test_message ' + str(random.randint(0, 100))})
            # await websocket.receive()
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.5)
                logger.info(f"Got websocket message: " + msg)
            except Exception as e:
                a=5
                pass
            
            
        except Exception as e:
            logger.error(f"Websocket error: {e}")
            initializer.ra_frontend.remove_websocket_client(id=client_id)
            break

# Endpoint for storing IO configuration, IO per point config is a service call instead
# JSON payload for GETs

# Configuration in database
# IO state data structure
# Clean up unused stuff
# figure out multiple websockets
# how to get rosbridge websocket into context manager