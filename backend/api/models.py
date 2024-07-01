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
class FrontendIOPointConfiguration:
    point_type: IOPointType
    point_index: int

@dataclass
class FrontendChartTraceConfiguration:
    color: str
    label: str
    # y_component_name: str
    y_parameter_name: str
    # y_data_value_name: str
    # y_component_name: "computed_measurements",
    # y_parameter_name: "filtered_blow_tank_mass",
    # color: "#9700FF",
    # label: "blow_tank_mass"

@dataclass
class FrontendChartConfiguration:
    chart_id: str
    title: str
    width_px: int
    height_px: int
    max_length: int
    x_data_value_name: str
    y_axis_decimal_places: int
    trace_configuration: List[FrontendChartTraceConfiguration]

@dataclass
class FrontendConfiguration:
    client_id: int
    io_points: FrontendIOPointConfiguration
    charts: List[FrontendChartConfiguration]

    def serialize(self) -> Dict:
        serialized_message = asdict(self, dict_factory=websocket_message_dict_factory)
        return serialized_message





# @dataclass
# class GaugeStreamConfiguration:
#     gauge_id: str
#     gauge_text: str
#     gauge_minimum: float
#     gauge_maximum: float
#     gauge_warning_threshold: float
#     gauge_danger_threshold: float
#     gauge_colors_reversed: bool
#     data_value_component_name: str
#     data_value_attribute_name: str

# @dataclass
# class FrontendComponentsConfiguration:
#     message_log_length: int

# @dataclass
# class FrontendIOChannelConfiguration:
#     channel_index: int
#     channel_type: IOPointType

# @dataclass
# class FrontendIOModuleConfiguration:
#     module_name: str
#     module_index: int
#     io_points: List[FrontendIOChannelConfiguration]

# @dataclass
# class FrontendHardwareComponentConfiguration:
#     hardware_component: InitVar[CarbonatorHardwareComponent]

#     name: str
#     PID_tag: str = None
#     parameters: Dict[str, FrontentHardwareComponentParameterConfiguration] = field(default_factory=dict)
#     # controllable_parameters: Dict[str, ParameterStreamData] = field(default_factory=dict)
#     # measurable_parameters: Dict[str, ParameterStreamData] = field(default_factory=dict)

#     def __post_init__(self, hardware_component: CarbonatorHardwareComponent):
#         for parameter_name, parameter in hardware_component.configuration.controllable_parameters.items():
#             self.parameters[parameter_name] = FrontentHardwareComponentParameterConfiguration(
#                 name=parameter_name,
#                 parameter=parameter
#             )
        
#         for parameter_name, parameter in hardware_component.configuration.measurable_parameters.items():
#             self.parameters[parameter_name] = FrontentHardwareComponentParameterConfiguration(
#                 name=parameter_name,
#                 parameter=parameter
#             )
        
#         self.PID_tag = hardware_component.configuration.PID_tag

# @dataclass
# class TransmittedFrontendConfiguration:
#     client_id: int
#     component_configuration: FrontendComponentsConfiguration
#     charts: List[FrontendChartConfiguration]
#     gauges: List[GaugeStreamConfiguration]
#     io_modules: List[FrontendIOModuleConfiguration]
#     # hardware_configuration: Dict[str, FrontendHardwareComponentConfiguration]

#     def serialize(self) -> Dict:
#         serialized_message = asdict(self, dict_factory=websocket_message_dict_factory)
#         return serialized_message