from dataclasses import (
    dataclass,
    asdict
)
from loguru import logger
from enum import (
    Enum,
    auto
)
from typing import (
    List,
    ClassVar,
    Callable,
    Dict
)
from utils.utils import (
    io_record_dict_factory
)

class IOConfigurationException(Exception):
    pass

class IOPointType(Enum):
    DIGITAL_INPUT = auto()
    DIGITAL_OUTPUT = auto()
    ANALOG_VOLTAGE_INPUT = auto()
    ANALOG_VOLTAGE_OUTPUT = auto()
    ANALOG_CURRENT_INPUT = auto()
    ANALOG_CURRENT_OUTPUT = auto()

class TransferFunctionType(Enum):
    LINEAR = auto()
    CUSTOM = auto()

@dataclass
class IOPoint:
    point_type: IOPointType
    name: str
    index: int
    enabled: bool
    
    configured: bool = False
    state: bool | int | float | None = None
    transfer_function: ClassVar[Callable[[float], float]] = lambda x: x

    @property
    def transformed_value(self) -> float | int | bool:
        return self.transfer_function(self.state)
    
    @staticmethod
    def load_configuration(configuration: Dict) -> "IOPoint":
        try:
            point = IOPoint(
                point_type=getattr(IOPointType, configuration['point_type']),
                name=configuration['name'],
                index=configuration['index'],
                enabled=configuration['enabled']
            )
            point.configured = configuration['configured']
            return point
        except KeyError:
            logger.error(f"Attemped to load invalid IO point configuration: {configuration}")
            raise IOConfigurationException("Invalid configuration!")
    
    def serialize(self):
        return asdict(self, dict_factory=io_record_dict_factory)

@dataclass
class IOPort:
    name: str
    number_of_points: int
    
    points: List[IOPoint | None] = None

    def __post_init__(self):
        self.points = self.number_of_points*[None]

    def add_point(self, point_type: IOPointType, name: str, index: int):
        point = IOPoint(
            point_type=point_type,
            name=name,
            index=index,
            enabled=False
        )
        point.configured = True

        try:
            self.points[index] = point
        except IndexError:
            logger.error(f"Cannot add point to {self.name} at index {index}, index out of range.")
    
    def remove_point(self, index: int):
        try:
            self.points[index] = None
        except IndexError:
            logger.error(f"Cannot remove point from {self.name} at index {index}, index out of range.")
        
    @staticmethod
    def load_configuration(configuration: Dict) -> "IOPort":
        try:
            port = IOPort(
                name=configuration['name'],
                number_of_points=configuration['number_of_points']
            )
            
            for i, p in enumerate(configuration['points']):
                if p is not None:
                    port.points[i] = IOPoint.load_configuration(p)
            
            return port
            # port.points = [IOPoint.load_configuration(p) for p in configuration['points']]
        except KeyError:
            logger.error(f"Attemped to load invalid IO port configuration: {configuration}")
            raise IOConfigurationException("Invalid configuration!")
    
    def serialize(self):
        return asdict(self, dict_factory=io_record_dict_factory)

@dataclass
class IOSystem:
    digital_inputs: IOPort = None
    digital_outputs: IOPort = None
    programmable_digital_io: IOPort = None
    analog_inputs: IOPort = None
    analog_outputs: IOPort = None

    def __post_init__(self):
        self.digital_inputs = IOPort(
            name="digital_inputs",
            number_of_points=8
        )

        self.digital_outputs = IOPort(
            name="digital_outputs",
            number_of_points=8
        )

        self.programmable_digital_io = IOPort(
            name="programmable_digital_io",
            number_of_points=12
        )

        self.analog_inputs = IOPort(
            name="analog_inputs",
            number_of_points=4
        )

        self.analog_outputs = IOPort(
            name="analog_outputs",
            number_of_points=3
        )
    
    @staticmethod
    def load_configuration(configuration: Dict) -> "IOSystem":
        try:
            io_system = IOSystem()
            io_system.digital_inputs = IOPort.load_configuration(configuration['io_system']['digital_inputs'])
            io_system.digital_outputs = IOPort.load_configuration(configuration['io_system']['digital_outputs'])
            io_system.programmable_digital_io = IOPort.load_configuration(configuration['io_system']['programmable_digital_io'])
            io_system.analog_inputs = IOPort.load_configuration(configuration['io_system']['analog_inputs'])
            io_system.analog_outputs = IOPort.load_configuration(configuration['io_system']['analog_outputs'])
            return io_system
        except KeyError:
            logger.error(f"Attemped to load invalid IO system configuration: {configuration}")
            raise IOConfigurationException("Invalid configuration!")
    
    def serialize(self):
        return asdict(self, dict_factory=io_record_dict_factory)

