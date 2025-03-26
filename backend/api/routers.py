# RA Backend Routers
# Developed by R2 Labs

import secrets, time, asyncio, random

from fastapi import WebSocket, APIRouter, Body
from datetime import datetime
from typing import List, Dict
from loguru import logger

import backend.system_initializer as initializer

from backend.auth.models import UserLoginSchema
from backend.auth.jwt_handler import signJWT

# from auth.jwt_bearer import JWTBearer
from backend.api.models import (
    AuthenticationResponse,
    APIResponse,
    FrontendConfiguration,
    # IOConfigurationRequestData,
    AnalogIOStatePostData,
    APIException,
    UIConfiguration,
    AnalogIOConfigurationRequestData,
    DigitalIOConfigurationRequestData,
)

from backend.api.helpers import create_database_document, create_database_axis_document

from backend.config.models import TransferFunctionType, IOPointType, AnalogIOPointType

from backend.database.models import DocumentType

auth_router = APIRouter(tags=["User"])

state_router = APIRouter(tags=["Status"])

ui_router = APIRouter(tags=["User Interface"])

historian_router = APIRouter(tags=["Data Historian"])

streams_router = APIRouter(tags=["Data Streams"])

config_router = APIRouter(tags=["Configuration"])

###############################################################################
############################### AUTHENTICATION ################################
###############################################################################


def check_user(data: UserLoginSchema):
    # return True
    # for user in system_initializer.system_controller.configuration.frontend.users:
    #     if user.username == data.username and user.password == data.password:
    #         return True
    # return False
    if data.username in ["r2", "roby", "lucas"] and data.password == "password":
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
                secret=secrets.token_urlsafe(32),
                algorithm="HS256",
            ),
        )

    else:
        # logger.info(f"Login failed for user {user.username}")
        return AuthenticationResponse(authenticated=False, signed_token="")


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

    configuration = initializer.ra_database.get_latest_ui_configuration()
    if configuration is None:
        configuration = UIConfiguration(client_id=client_id)
    else:
        configuration.client_id = client_id

    return APIResponse(error=False, data=configuration.dict())


@ui_router.post("/configuration")
async def update_ui_configuration(configuration: UIConfiguration) -> APIResponse:
    initializer.ra_database.enqueue_record(
        data=create_database_document(
            timestamp=datetime.utcnow().timestamp(),
            document_type=DocumentType.UI_CONFIGURATION,
            data=configuration.dict(),
        )
    )

    return APIResponse(error=False, data="Successful save of UI configuration")


@ui_router.get("/io_configuration")
def get_ui_io_configuration():
    config = initializer.ra_database.get_latest_system_configuration(timeout=1)
    return APIResponse(
        error=False, data=config.serialize() if config is not None else None
    )


###############################################################################
############################## DATABASE REQUESTS ##############################
###############################################################################


# TODO make new endpoints that just return raw ROS JSON data
@historian_router.get("/io_data")
def get_io_data_points(number_of_points: int) -> APIResponse:
    points = initializer.ra_database.get_io_state(
        number_of_points=number_of_points, timeout=1
    )
    return APIResponse(error=False, data=[p.serialize_to_dict() for p in points])


@historian_router.get("/analog_in")
def get_io_data_points(number_of_points: int) -> APIResponse:
    points = initializer.ra_database.get_analog_in_state(
        number_of_points=number_of_points, timeout=1
    )
    return APIResponse(error=False, data=[p.serialize_to_dict() for p in points])


@historian_router.get("/digital_in")
def get_io_data_points(number_of_points: int) -> APIResponse:
    points = initializer.ra_database.get_digital_in_state(
        number_of_points=number_of_points, timeout=1
    )
    return APIResponse(error=False, data=[p.serialize_to_dict() for p in points])


# @historian_router.get("/ros_io_data")
# def get_io_data_points(number_of_points: int) -> APIResponse:
#     points = initializer.ra_database.get_io_state(number_of_points=number_of_points, timeout=1)
#     return APIResponse(
#         error=False,
#         data=[p.data_dictionary for p in points]
#     )


@historian_router.get("/messages")
def get_messages(number_of_messages: int) -> APIResponse:
    messages = initializer.ra_database.get_messages(
        number_of_messages=number_of_messages, timeout=1
    )
    return APIResponse(error=False, data=[m.serialize_to_dict() for m in messages])


@historian_router.get("/sensor_data")
def get_sensor_data(number_of_data_points: int) -> APIResponse:
    data = initializer.ra_database.get_sensor_data(
        number_of_data_points=number_of_data_points, timeout=1
    )
    return APIResponse(error=False, data=[d.serialize_to_dict() for d in data])


@historian_router.get("/axis/{axis_index}")
def get_axis_state(axis_index: int, number_of_points: int) -> APIResponse:
    points = initializer.ra_database.get_axis_state(
        axis_index=axis_index, number_of_points=number_of_points, timeout=30
    )
    # points = initializer.ra_database.get_digital_in_state(number_of_points=number_of_points, timeout=1)
    return APIResponse(error=False, data=[p.serialize_to_dict() for p in points])

    for record in data:
        initializer.ra_database.enqueue_record(
            data=create_database_document(
                timestamp=datetime.timestamp(datetime.utcnow()),
                document_type=document_type,
                data=dict(record),
            )
        )

    return APIResponse(
        error=False, data=f"Successful insertion of ROS axis {index} data"
    )


###############################################################################
############################### DATABASE INSERTS ##############################
###############################################################################

# TODO Accept ROS AnalogIn message instead
# TODO actually, just accept JSON from ROS2JSON
# @historian_router.post("/io_data")
# def push_io_state(data: AnalogIOStatePostData) -> APIResponse:
#     initializer.ra_interface.io_system.analog_inputs.points[0].state = data.values[0]
#     initializer.ra_interface.io_system.analog_inputs.points[1].state = data.values[1]
#     initializer.ra_interface.io_system.analog_inputs.points[2].state = data.values[2]
#     for ndx, ai in enumerate(initializer.ra_interface.io_system.analog_inputs.points):
#         ai.state = data.values[ndx]

#     initializer.ra_database.enqueue_record(
#         data=create_database_document(
#             timestamp=data.time_sec + data.time_nsec / 1e9,
#             document_type=DocumentType.IO_STATE,
#             data=initializer.ra_interface.io_system.serialize()
#         )
#     )

#     return APIResponse(
#         error=False,
#         data="Successful insertion of analog input data"
#     )

# @historian_router.post("/ros_io_data")
# def push_io_state(data: Dict) -> APIResponse:
#     initializer.ra_database.enqueue_record(
#         data=create_database_document(
#             timestamp=datetime.timestamp(datetime.utcnow()),
#             document_type=DocumentType.IO_STATE,
#             data=dict(data)
#         )
#     )

#     return APIResponse(
#         error=False,
#         data="Successful insertion of ROS analog input data"
#     )


@historian_router.post("/analog_in")
def push_analog_input_state(data: List[Dict]) -> APIResponse:
    for record in data:
        try:
            timestamp = datetime.fromtimestamp(
                record["stamp"]["sec"] + record["stamp"]["nanosec"] / 1e9
            ).timestamp()
        except Exception as e:
            timestamp = datetime.timestamp(datetime.utcnow())

        initializer.ra_database.enqueue_record(
            data=create_database_document(
                timestamp=timestamp,
                document_type=DocumentType.ANALOG_INPUT_STATE,
                data=dict(record),
            )
        )

    return APIResponse(
        error=False, data="Successful insertion of ROS analog input data"
    )


@historian_router.post("/digital_in")
def push_digital_input_state(data: List[Dict]) -> APIResponse:
    for record in data:
        try:
            timestamp = datetime.fromtimestamp(
                record["stamp"]["sec"] + record["stamp"]["nanosec"] / 1e9
            ).timestamp()
        except Exception as e:
            timestamp = datetime.timestamp(datetime.utcnow())

        initializer.ra_database.enqueue_record(
            data=create_database_document(
                timestamp=timestamp,
                document_type=DocumentType.DIGITAL_INPUT_STATE,
                data=dict(record),
            )
        )

    return APIResponse(
        error=False, data="Successful insertion of ROS digital input data"
    )


@historian_router.post("/axis/{axis_index}")
def push_axis_state(axis_index: int, data: List[Dict]) -> APIResponse:
    for record in data:
        try:
            timestamp = datetime.fromtimestamp(
                record["stamp"]["sec"] + record["stamp"]["nanosec"] / 1e9
            ).timestamp()
        except Exception as e:
            timestamp = datetime.timestamp(datetime.utcnow())

        initializer.ra_database.enqueue_record(
            data=create_database_axis_document(
                timestamp=timestamp,
                # document_type=DocumentType.AXIS_STATE,
                axis_index=axis_index,
                data=dict(record),
            )
        )

    return APIResponse(
        error=False, data=f"Successful insertion of ROS axis {axis_index} data"
    )


@historian_router.post("/realtime_sys_state")
def push_realtime_system_state(data: List[Dict]) -> APIResponse:
    initializer.ra_database.enqueue_record(
        data=create_database_document(
            timestamp=datetime.timestamp(datetime.utcnow()),
            document_type=DocumentType.IO_STATE,
            data=dict(data),
        )
    )

    return APIResponse(
        error=False, data="Successful insertion of ROS realtime system state data"
    )


###############################################################################
################################ CONFIGURATION ################################
###############################################################################


def assign_analog_io_points(
    point_type: IOPointType, configurations: List[AnalogIOConfigurationRequestData]
):
    for config_entry in configurations:
        point = initializer.ra_interface.io_system.get_io_port(
            point_type=point_type
        ).points[config_entry.channel]
        point.configuration.channel = config_entry.channel
        point.configuration.type = point_type
        point.configuration.configured = config_entry.hardware_config.configured
        point.configuration.label = config_entry.label
        point.configuration.max_signal_v = config_entry.max_electrical_value
        point.configuration.min_signal_v = config_entry.min_electrical_value
        point.configuration.max_value = config_entry.max_measurement_value
        point.configuration.min_value = config_entry.min_measurement_value
        point.configuration.measurement_unit = config_entry.unit

        try:
            point.configuration.transfer_function_type = TransferFunctionType(
                config_entry.transfer_function_type
            )
        except Exception as e:
            logger.warning(
                f"Unrecognized transfer function type {config_entry.transfer_function_type} for {point_type} point {config_entry.channel}, defaulting to LINEAR"
            )
            point.configuration.transfer_function_type = TransferFunctionType.LINEAR

        if point_type == IOPointType.ANALOG_INPUT:
            point.configuration.analog_type = AnalogIOPointType(
                config_entry.hardware_config.channel_type
            )

        initializer.ra_interface.save_system_configuration()


@config_router.post("/io/analog_in_config")
def configure_analog_in(
    configurations: List[AnalogIOConfigurationRequestData],
) -> APIResponse:
    logger.info(f"Got analog input configuration request: {configurations}")
    assign_analog_io_points(
        point_type=IOPointType.ANALOG_INPUT, configurations=configurations
    )

    return APIResponse(
        error=False, data=f"Got analog input configuration request: {configurations}"
    )


@config_router.post("/io/analog_out_config")
def configure_analog_out(
    configurations: List[AnalogIOConfigurationRequestData],
) -> APIResponse:
    logger.info(f"Got analog output configuration request: {configurations}")
    assign_analog_io_points(
        point_type=IOPointType.ANALOG_OUTPUT, configurations=configurations
    )

    return APIResponse(
        error=False, data=f"Got analog output configuration request: {configurations}"
    )


def assign_digital_io_points(
    point_type: IOPointType, configurations: List[DigitalIOConfigurationRequestData]
):
    for config_entry in configurations:
        point = initializer.ra_interface.io_system.get_io_port(
            point_type=point_type
        ).points[config_entry.channel]
        point.configuration.channel = config_entry.channel
        point.configuration.type = point_type
        point.configuration.configured = config_entry.hardware_config.configured
        point.configuration.label = config_entry.label
        initializer.ra_interface.save_system_configuration()


@config_router.post("/io/digital_in_config")
def configure_digital_in(
    configurations: List[DigitalIOConfigurationRequestData],
) -> APIResponse:
    logger.info(f"Got digital input configuration request: {configurations}")
    assign_digital_io_points(
        point_type=IOPointType.DIGITAL_INPUT, configurations=configurations
    )

    return APIResponse(
        error=False, data=f"Got digital input configuration request: {configurations}"
    )


@config_router.post("/io/digital_out_config")
def configure_digital_out(
    configurations: List[DigitalIOConfigurationRequestData],
) -> APIResponse:
    logger.info(f"Got digital output configuration request: {configurations}")
    assign_digital_io_points(
        point_type=IOPointType.DIGITAL_OUTPUT, configurations=configurations
    )

    return APIResponse(
        error=False, data=f"Got digital output configuration request: {configurations}"
    )


# @config_router.post("/io/configure_point")
# def configure_io_point(config: IOConfigurationRequestData) -> APIResponse:
#     logger.info(f"Got configuration request: {config}")

#     # TODO FIXME to match point types
#     if config.point_type == 0 or config.point_type == 1:
#         # Analog voltage or current input
#         point = initializer.ra_interface.io_system.analog_inputs.points[config.channel]
#         point.configuration.type = IOPointType.ANALOG_VOLTAGE_INPUT if config.point_type == 0 else IOPointType.ANALOG_CURRENT_INPUT
#         point.configuration.label = config.label
#         point.configuration.max_signal_v = config.max_electrical_value
#         point.configuration.min_signal_v = config.min_electrical_value
#         point.configuration.max_value = config.max_measurement_value
#         point.configuration.min_value = config.min_measurement_value
#         point.configuration.measurement_unit = config.measurement_unit

#         # FIXME to match transfer function types
#         point.configuration.transfer_function_type = TransferFunctionType(config.transfer_function_type + 1)
#         point.configuration.transfer_function_callback = config.custom_transfer_function if point.configuration.transfer_function_type == TransferFunctionType.CUSTOM else None

#         initializer.ra_interface.save_system_configuration()

#     else:
#         raise APIException(f"Unknown point type {config.point_type}")

#     return APIResponse(
#         error=False,
#         data=f"Got configuration request: {config}"
#     )

###############################################################################
################################## STREAMING ##################################
###############################################################################


@streams_router.websocket("/socket")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = initializer.ra_frontend.add_websocket_client()
    logger.info(f"Websocket client {client_id} connected")
    while True:

        try:
            logger.info(f"Websocket streaming to client {client_id}")

            await asyncio.sleep(1)
            await websocket.send_json(
                {
                    "id": client_id,
                    "message": "test_message " + str(random.randint(0, 100)),
                }
            )
            # await websocket.receive()
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.5)
                logger.info(f"Got websocket message: " + msg)
            except Exception as e:
                a = 5
                pass

        except Exception as e:
            logger.error(f"Websocket error: {e}")
            initializer.ra_frontend.remove_websocket_client(id=client_id)
            break
