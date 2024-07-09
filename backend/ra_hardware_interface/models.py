from dataclasses import (
    dataclass,
    asdict,
    fields
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
    Dict,
    Tuple,
    Any
)
from utils.utils import (
    io_record_dict_factory
)

from config.models import (
    IOPointType,
    ROSIOPointConfiguration,
    IOSystemConfiguration
)

class IOConfigurationException(Exception):
    pass

# @dataclass
# class IOPoint:
#     point_type: IOPointType
#     name: str
#     index: int
#     enabled: bool
    
#     configured: bool = False
#     state: bool | int | float | None = None
#     transfer_function: ClassVar[Callable[[float], float]] = lambda x: x

#     @property
#     def transformed_value(self) -> float | int | bool:
#         return self.transfer_function(self.state)
    
#     @staticmethod
#     def load_configuration(configuration: Dict) -> "IOPoint":
#         try:
#             point = IOPoint(
#                 point_type=getattr(IOPointType, configuration['point_type']),
#                 name=configuration['name'],
#                 index=configuration['index'],
#                 enabled=configuration['enabled']
#             )
#             point.configured = configuration['configured']
#             return point
#         except KeyError:
#             logger.error(f"Attemped to load invalid IO point configuration: {configuration}")
#             raise IOConfigurationException("Invalid configuration!")
    
#     def serialize(self):
#         return asdict(self, dict_factory=io_record_dict_factory)

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

    # def __dict__(self) -> Dict:
    #     return {'a':5}

    @staticmethod
    def dict_factory(attrs: List[Tuple[str, Any]]) -> Dict[str, bool | float | None]:
        # def io_record_dict_factory(dataclass):
        d = {}
        for field_name, field in attrs:
            if isinstance(field, (float, bool, int)):
                d[field_name] = field
            else:
                pass
            # if isinstance(field[1], Enum):
            #     d[field[0]] = field[1].name
            # elif field[0] == '_id':
            #     pass
            # elif field[1] == None:
            #     pass
            # elif isinstance(field[1], Callable):
            #     pass
            # else:
            #     d[field[0]] = field[1]
        return d

    # @staticmethod
    # def load_configuration(configuration: Dict) -> "IOPoint":
    #     try:
    #         point = IOPoint(
    #             point_type=getattr(IOPointType, configuration['point_type']),
    #             name=configuration['name'],
    #             index=configuration['index'],
    #             enabled=configuration['enabled']
    #         )
    #         point.configured = configuration['configured']
    #         return point
    #     except KeyError:
    #         logger.error(f"Attemped to load invalid IO point configuration: {configuration}")
    #         raise IOConfigurationException("Invalid configuration!")
    
    def serialize(self):
        serialized = asdict(self, dict_factory=IOPoint.dict_factory)
        # if serialized == {}:
        #     return None
        return serialized
        # return asdict(self, dict_factory=IOPoint.dict_factory)
    
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

    # @property
    # def number_of_points(self) -> int:
    #     if self.points is None:
    #         return 0
    #     else:
    #         return len(self.points)

    # def __dict__(self) -> Dict:
    #     return {'a':5}

    @classmethod
    def dict_factory(cls: "IOPort") -> Dict:
        d = {}
        field: Tuple[str, Any | "IOPoint"]
        for field in cls:
            if isinstance(field[1], IOPoint):
                # field[1]: IOPoint
                d[field[0]] = field[1].serialize()
            else:
                pass
            # if isinstance(field[1], Enum):
            #     d[field[0]] = field[1].name
            # elif field[0] == '_id':
            #     pass
            # elif field[1] == None:
            #     pass
            # elif isinstance(field[1], Callable):
            #     pass
            # else:
            #     d[field[0]] = field[1]
        return d

    def __post_init__(self):
        if self.points is None:
            self.points = self.number_of_points*[IOPoint.default()]

    def add_point(self, point_configuration: ROSIOPointConfiguration):
        point = IOPoint(
            configuration=point_configuration,
            # point_type=point_configuration.point_type,
            # name=name,
            # index=index,
            # enabled=False
        )
        point.configured = True

        try:
            self.points[point_configuration.channel] = point
        except IndexError:
            logger.error(f"Cannot add point to {self.name} at index {point_configuration.channel}, index out of range.")

    # def add_point(self, point_type: IOPointType, name: str, index: int):
    #     point = IOPoint(
    #         point_type=point_type,
    #         name=name,
    #         index=index,
    #         enabled=False
    #     )
    #     point.configured = True

    #     try:
    #         self.points[index] = point
    #     except IndexError:
    #         logger.error(f"Cannot add point to {self.name} at index {index}, index out of range.")
    
    def remove_point(self, index: int):
        try:
            self.points[index] = None
        except IndexError:
            logger.error(f"Cannot remove point from {self.name} at index {index}, index out of range.")
        
    # @staticmethod
    # def load_configuration(configuration: Dict) -> "IOPort":
    #     try:
    #         port = IOPort(
    #             name=configuration['name'],
    #             number_of_points=configuration['number_of_points']
    #         )
            
    #         for i, p in enumerate(configuration['points']):
    #             if p is not None:
    #                 port.points[i] = IOPoint.load_configuration(p)
            
    #         return port
    #         # port.points = [IOPoint.load_configuration(p) for p in configuration['points']]
    #     except KeyError:
    #         logger.error(f"Attemped to load invalid IO port configuration: {configuration}")
    #         raise IOConfigurationException("Invalid configuration!")
    
    # def serialize(self):
    #     # return asdict(self, dict_factory=io_record_dict_factory)
    #     return asdict(self, dict_factory=IOPort.dict_factory)
    def serialize(self) -> Dict:
        # return asdict(self, dict_factory=io_record_dict_factory)
        d = {}
        for field in fields(self):
            # field_name = field[0]
            
            if field.type == List[IOPoint]:
            # if isinstance(attribute, IOPort):
                d[field.name] = []
                for index, entry in enumerate(getattr(self, field.name)):
                    # attribute: IOPoint = getattr(self, field.name)
                    if isinstance(entry, IOPoint):
                        # if entry is not None:
                        d[field.name].append(entry.serialize())
                        # try:
                        #     d[field.name].append(entry.serialize()) if entry is not None else pass
                        #     d[field.name][index] = entry.serialize()
                        # except Exception as e:
                        #     a=5
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

    # @classmethod
    # @staticmethod
    # def dict_factory(cls: "IOSystem") -> Dict:
    #     d = {}
    #     for field in cls:
    #         if isinstance(field[1], IOPort):
    #             field[1]: IOPort
    #             d[field[0]] = field[1].serialize()
    #         else:
    #             pass
            # if isinstance(field[1], Enum):
            #     d[field[0]] = field[1].name
            # elif field[0] == '_id':
            #     pass
            # elif field[1] == None:
            #     pass
            # elif isinstance(field[1], Callable):
            #     pass
            # else:
            #     d[field[0]] = field[1]
        # return d

    def __post_init__(self):
        self.load_configuration(self.configuration)
        # self.digital_inputs = IOPort(
        #     name="digital_inputs",
        #     number_of_points=8
        # )

        # self.digital_outputs = IOPort(
        #     name="digital_outputs",
        #     number_of_points=8
        # )

        # self.programmable_digital_io = IOPort(
        #     name="programmable_digital_io",
        #     number_of_points=12
        # )

        # self.analog_inputs = IOPort(
        #     name="analog_inputs",
        #     number_of_points=4
        # )

        # self.analog_outputs = IOPort(
        #     name="analog_outputs",
        #     number_of_points=3
        # )
    
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
    
    # @staticmethod
    # def load_configuration(configuration: Dict) -> "IOSystem":
    #     try:
    #         io_system = IOSystem()
    #         io_system.digital_inputs = IOPort.load_configuration(configuration['io_system']['digital_inputs'])
    #         io_system.digital_outputs = IOPort.load_configuration(configuration['io_system']['digital_outputs'])
    #         io_system.programmable_digital_io = IOPort.load_configuration(configuration['io_system']['programmable_digital_io'])
    #         io_system.analog_inputs = IOPort.load_configuration(configuration['io_system']['analog_inputs'])
    #         io_system.analog_outputs = IOPort.load_configuration(configuration['io_system']['analog_outputs'])
    #         return io_system
    #     except KeyError:
    #         logger.error(f"Attemped to load invalid IO system configuration: {configuration}")
    #         raise IOConfigurationException("Invalid configuration!")
    
    def serialize(self) -> Dict:
        # return asdict(self, dict_factory=io_record_dict_factory)
        d = {}
        for field in fields(self):
            # field_name = field[0]
            
            if field.type == IOPort:
            # if isinstance(attribute, IOPort):
                attribute: IOPort = getattr(self, field.name)
                if isinstance(attribute, IOPort):
                    d[field.name] = attribute.serialize()
                else:
                    d[field.name] = None
        return d

        # return asdict(self, dict_factory=IOSystem.dict_factory)

