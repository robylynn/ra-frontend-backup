from pydantic import (
    BaseModel, 
    Field
)
from typing import (
    List,
    Dict,
    Optional
)
from dataclasses import (
    dataclass,
    asdict
)
from enum import Enum, auto

from utils.utils import websocket_message_dict_factory
from config.models import (
    IOPointType
)

class APIException(Exception):
    pass

class AuthenticationResponse(BaseModel):
    authenticated: bool
    signed_token: str

class APIResponse(BaseModel):
    error: bool
    data: str | List | Dict

class IOConfigurationRequestData(BaseModel):
    point_type: int
    label: str
    max_electrical_value: float
    min_electrical_value: float
    max_measurement_value: float
    min_measurement_value: float
    transfer_function_type: int
    custom_transfer_function: str
    channel: int
    measurement_unit: str
    # point_type: str

class AnalogInputHardwareConfigurationRequestData(BaseModel):
    configure: bool
    enable: bool
    channel_type: int

class DigitalInputHardwareConfigurationRequestData(BaseModel):
    configure: bool
    enable: bool

class AnalogIOConfigurationRequestData(BaseModel):
    hardware_config: AnalogInputHardwareConfigurationRequestData
    channel: int
    # point_type: int
    label: str
    max_electrical_value: float
    min_electrical_value: float
    max_measurement_value: float
    min_measurement_value: float
    transfer_function_type: int
    # custom_transfer_function: str
    # channel: int
    unit: str

class DigitalIOConfigurationRequestData(BaseModel):
    hardware_config: DigitalInputHardwareConfigurationRequestData
    channel: int
    # point_type: int
    label: str
    # max_electrical_value: float
    # min_electrical_value: float
    # max_measurement_value: float
    # min_measurement_value: float
    # transfer_function_type: int
    # # custom_transfer_function: str
    # # channel: int
    # unit: str

class AnalogIOStatePostData(BaseModel):
    # read_channel: bool
    # value: float
    # point_type: str
    time_sec: int
    time_nsec: int
    values: Dict[int, float]

# class IOPointType(Enum):
#     NULL_POINT = auto()
#     DIGITAL_INPUT = auto()
#     ANALOG_VOLTAGE_INPUT = auto()
#     ANALOG_CURRENT_INPUT = auto()
#     DIGITAL_OUTPUT = auto()
#     ANALOG_VOLTAGE_OUTPUT = auto()
#     ANALOG_CURRENT_OUTPUT = auto()
#     THERMOCOUPLE_INPUT = auto()

@dataclass
class FrontendConfiguration:
    client_id: int

    def serialize(self):
        return asdict(self)

class PlotConfiguration(BaseModel):
    # enabled: Optional[bool] = False
    # data_sources: Optional[List[str]] = []

    enabled: bool = Field(default=False)
    data_sources: List[int] = Field(default=[])
    length: int = Field(default=100)
    update_rate: int = Field(default=5)

# @dataclass
class UIConfiguration(BaseModel):
    client_id: int
    # plots: Optional[List[PlotConfiguration]] = []
    # plots: List[PlotConfiguration] = Field(default=[])
    io_plots: Dict[IOPointType, List[PlotConfiguration]] = Field(default={})
    motion_plots: List[PlotConfiguration] = Field(default=[])
    