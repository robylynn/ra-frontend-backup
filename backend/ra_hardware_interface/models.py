from loguru import logger

from dataclasses import (
    dataclass,
    asdict,
    fields,
    InitVar
)

from enum import (
    Enum,
    auto
)
from typing import (
    List,
    ClassVar,
    Callable,
    Dict,
    Tuple,
    Any
)

from config.models import (
    IOPointType,
    ROSIOPointConfiguration,
    IOSystemConfiguration
)

class IOConfigurationException(Exception):
    pass

@dataclass
class IOPoint:
    configuration: ROSIOPointConfiguration

    configured: bool = False
    state: bool | int | float | None = None
    transfer_function: ClassVar[Callable[[float], float]] = lambda x: x

    @property
    def transformed_value(self) -> float | int | bool:
        return self.transfer_function(self.state)
    
    @staticmethod
    def default() -> "IOPoint":
        return IOPoint(configuration=ROSIOPointConfiguration.default())

    @staticmethod
    def dict_factory(attrs: List[Tuple[str, Any]]) -> Dict[str, bool | float | None]:
        d = {}
        for field_name, field in attrs:
            if isinstance(field, (float, bool, int)):
                d[field_name] = field
            else:
                pass
        return d
    
    def serialize(self):
        serialized = asdict(self, dict_factory=IOPoint.dict_factory)
        return serialized
    
    def load_transfer_function(self):
        if self.configuration.transfer_function_callback is not None:
            try:
                _ = eval(self.configuration.transfer_function_callback, {'val': self.configuration.max_signal_v})
                _ = eval(self.configuration.transfer_function_callback, {'val': self.configuration.min_signal_v})
            except Exception as e:
                logger.error(f"Invalid transfer function callback {self.configuration.transfer_function_callback} for {self.configuration.type} point {self.configuration.channel}: {e}")
            self.transfer_function = lambda x: eval(self.configuration.transfer_function_callback, {'val': x})
        else:
            self.transfer_function = lambda x: x / (self.configuration.max_signal_v - self.configuration.min_signal_v) * (self.configuration.max_value - self.configuration.min_value)


@dataclass
class IOPort:
    name: str
    number_of_points: int
    
    points: List[IOPoint] = None

    @classmethod
    def dict_factory(cls: "IOPort") -> Dict:
        d = {}
        field: Tuple[str, Any | "IOPoint"]
        for field in cls:
            if isinstance(field[1], IOPoint):
                d[field[0]] = field[1].serialize()
            else:
                pass
        return d

    def __post_init__(self):
        if self.points is None:
            self.points = self.number_of_points*[IOPoint.default()]

    def add_point(self, point_configuration: ROSIOPointConfiguration):
        point = IOPoint(
            configuration=point_configuration,
        )
        point.configured = True

        try:
            self.points[point_configuration.channel] = point
        except IndexError:
            logger.error(f"Cannot add point to {self.name} at index {point_configuration.channel}, index out of range.")
    
    def remove_point(self, index: int):
        try:
            self.points[index] = None
        except IndexError:
            logger.error(f"Cannot remove point from {self.name} at index {index}, index out of range.")
        
    def serialize(self) -> Dict:
        d = {}
        for field in fields(self):
            if field.type == List[IOPoint]:
                d[field.name] = []
                for index, entry in enumerate(getattr(self, field.name)):
                    if isinstance(entry, IOPoint):
                        d[field.name].append(entry.serialize())
                    else:
                        d[field.name][index] = entry
        return d

@dataclass
class IOSystem:
    configuration: IOSystemConfiguration

    digital_inputs: IOPort = None
    digital_outputs: IOPort = None
    programmable_digital_io: IOPort = None
    analog_inputs: IOPort = None
    analog_outputs: IOPort = None

    def __post_init__(self):
        self.load_configuration(self.configuration)
    
    def load_configuration(self, configuration: IOSystemConfiguration):
        self.digital_inputs = IOPort(
            name="digital_inputs",
            number_of_points=len(configuration.digital_inputs),
            points=[
                IOPoint(configuration=c) for c in configuration.digital_inputs
            ]
        )

        self.digital_outputs = IOPort(
            name="digital_outputs",
            number_of_points=len(configuration.digital_inputs),
            points=[
                IOPoint(configuration=c) for c in configuration.digital_outputs
            ]
        )
    
    def serialize(self) -> Dict:
        d = {}
        for field in fields(self):
            if field.type == IOPort:
                attribute: IOPort = getattr(self, field.name)
                if isinstance(attribute, IOPort):
                    d[field.name] = attribute.serialize()
                else:
                    d[field.name] = None
        return d

@dataclass
class Sensor:
    name: str
    state: float | bool | None = None

    def serialize(self) -> Dict:
        return asdict(self)

@dataclass
class Sensors:
    sensors: InitVar[List[Sensor]]

    _sensors: ClassVar[Dict[str, Sensor]] = {}

    def __post_init__(self, sensors: List[Sensor]):
        self._sensors = {sensor.name: sensor for sensor in sensors}

    def add_sensor(self, sensor_name: str):
        self._sensors[sensor_name] = Sensor(
            name=sensor_name
        )

    def serialize(self) -> Dict:
        return {sensor_name: sensor.serialize() for sensor_name, sensor in self._sensors.items()}


