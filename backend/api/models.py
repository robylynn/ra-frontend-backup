from pydantic import BaseModel
from typing import (
    List,
    Dict
)
from dataclasses import (
    dataclass,
    asdict
)
from enum import Enum, auto

from utils.utils import websocket_message_dict_factory

class AuthenticationResponse(BaseModel):
    authenticated: bool
    signed_token: str

class APIResponse(BaseModel):
    error: bool
    data: str | List | Dict

class IOConfigurationRequestData(BaseModel):
    index: int
    point_type: str

class IOPointType(Enum):
    NULL_POINT = auto()
    DIGITAL_INPUT = auto()
    ANALOG_VOLTAGE_INPUT = auto()
    ANALOG_CURRENT_INPUT = auto()
    DIGITAL_OUTPUT = auto()
    ANALOG_VOLTAGE_OUTPUT = auto()
    ANALOG_CURRENT_OUTPUT = auto()
    THERMOCOUPLE_INPUT = auto()

@dataclass
class FrontendConfiguration:
    client_id: int

    def serialize(self):
        return asdict(self)
