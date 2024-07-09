from dataclasses import (
    dataclass,
    asdict,
    fields
)

from typing import (
    List,
    Dict,
    Generator,
    Tuple,
    Annotated,
    ClassVar,
    Callable
)

from enum import (
    Enum,
    auto
)

# from database.models import (
#     DocumentType
# )

class DocumentType(Enum):
    SENSOR_DATA = auto()
    EVENT = auto()
    # OPERATOR_NOTE = auto()
    FRONTEND_MESSAGE = auto()
    IO_STATE = auto()
    SYSTEM_CONFIGURATION = auto()
# from ra_hardware_interface.models import (
#     IOPointType
# )

def hardware_configurationo_dict_factory(dataclass):
    d = {}
    for field in dataclass:
        if isinstance(field[1], Enum):
            d[field[0]] = field[1].name
        elif field[0] == '_id':
            pass
        elif field[1] == None:
            pass
        elif isinstance(field[1], Callable):
            pass
        else:
            d[field[0]] = field[1]
    return d

# @dataclass
# class NetworkDevice:
#     name: str
#     customer: str
#     IP: str

#     def dump_json(self) -> Dict:
#         return asdict(self)

@dataclass
class CollectionConfiguration:
    # name: str
    drop_on_start: bool
    document_type: DocumentType
    capped: bool = False
    collection_size_bytes: int = None

    # @property
    # def attribute_name(self) -> str:
    #     return ''.join(["_", self.name, "_collection"])

@dataclass
class DatabaseCollectionsConfiguration:
    sensor_data: CollectionConfiguration
    events: CollectionConfiguration
    frontend_messages: CollectionConfiguration
    io_state: CollectionConfiguration
    hardware_configuration: CollectionConfiguration

    @property
    def database_collections(self) -> Dict[str, CollectionConfiguration]:
        return {
            f.name: getattr(self, f.name) for f in fields(self) if isinstance(getattr(self, f.name), CollectionConfiguration)
        }
    
    @property
    def database_collection_generator(self) -> Generator[Tuple[str, CollectionConfiguration], None, None]:
        for f in fields(self):
            if isinstance(getattr(self, f.name), CollectionConfiguration):
                yield f.name, getattr(self, f.name)

@dataclass
class MongoInstanceConfiguration:
    enabled: bool
    connection_timeout_ms: int
    server_selection_timeout_ms: int
    socket_timeout_ms: int
    cycle_count_before_yield: int
    host: str
    port: int
    username: str
    password: str
    database_name: str
    # data_timeseries_collection: str
    # event_timeseries_collection: str
    # frontend_message_collection: str = None
    # io_state_collection: str = None
    drop_database_on_start: bool = False
    # drop_collection_on_start: bool = False
    # use_frontend_message_collection: bool = False
    frontend_message_collection_size_bytes: int = 1000
    io_state_collection_size_bytes: int = 1000

@dataclass
class MongoConfiguration:
    database_synchronization_period_sec: int
    synchronization_batch_size: int
    queue_length_warning_threshold: int
    queue_get_timeout_secs: float
    
    collections: DatabaseCollectionsConfiguration
    
    local: MongoInstanceConfiguration
    cloud: MongoInstanceConfiguration

@dataclass
class SystemConfiguration:
    # devices: List[NetworkDevice]
    database: MongoConfiguration

##########################################################
#################### IO CONFIGURATION ####################
##########################################################

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
class ROSIOPointConfiguration:
    channel: int
    label: str = None
    enabled: bool = False
    type: IOPointType = None
    transfer_function_type: TransferFunctionType = None
    measurement_unit: str = None
    min_value: float = None
    min_signal_v: float = None
    max_value: float = None
    max_signal_v: float = None

    transfer_function_callback: str = None

    @staticmethod
    def default() -> "ROSIOPointConfiguration":
        return ROSIOPointConfiguration(channel=-1)

@dataclass
class IOSystemConfiguration:
    digital_inputs: Annotated[List[ROSIOPointConfiguration], 8]
    digital_outputs: Annotated[List[ROSIOPointConfiguration], 8]

@dataclass
class HardwareConfiguration:
    io_system: IOSystemConfiguration

    number_of_digital_inputs: ClassVar[int] = 8
    number_of_digital_outputs: ClassVar[int] = 8

    @staticmethod
    def parse(serialized_configuration: Dict) -> "HardwareConfiguration":
        digital_inputs = serialized_configuration['io_system']['digital_inputs']
        digital_outputs = serialized_configuration['io_system']['digital_outputs']
        return HardwareConfiguration(
            io_system=IOSystemConfiguration(
                digital_inputs=[ROSIOPointConfiguration(**di) for di in digital_inputs],
                digital_outputs=[ROSIOPointConfiguration(**do) for do in digital_outputs]
            )
            
        )
    
    @staticmethod
    def default_configuration() -> "HardwareConfiguration":
        digital_inputs = [
            ROSIOPointConfiguration(channel=x, type=IOPointType.DIGITAL_INPUT)
            for x in range(HardwareConfiguration.number_of_digital_inputs)
        ]

        digital_outputs = [
            ROSIOPointConfiguration(channel=x, type=IOPointType.DIGITAL_OUTPUT)
            for x in range(HardwareConfiguration.number_of_digital_outputs)
        ]

        return HardwareConfiguration(
            io_system=IOSystemConfiguration(
                digital_inputs=digital_inputs,
                digital_outputs=digital_outputs
            )
        )
    
    def serialize(self) -> Dict:
        return asdict(self, dict_factory=hardware_configurationo_dict_factory)