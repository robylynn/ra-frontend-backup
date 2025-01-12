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

class DocumentType(Enum):
    SENSOR_DATA = auto()
    EVENT = auto()
    FRONTEND_MESSAGE = auto()
    IO_STATE = auto()
    ANALOG_INPUT_STATE = auto()
    DIGITAL_INPUT_STATE = auto()
    AXIS_STATE = auto()
    # AXIS_1_STATE = auto()
    SYSTEM_CONFIGURATION = auto()
    UI_CONFIGURATION = auto()

def hardware_configuration_dict_factory(dataclass):
    d = {}
    for field in dataclass:
        if isinstance(field[1], Enum):
            d[field[0]] = field[1].name
        elif isinstance(field[1], Callable):
            pass
        else:
            d[field[0]] = field[1]
    return d

@dataclass
class CollectionConfiguration:
    drop_on_start: bool
    document_type: DocumentType
    capped: bool = False
    collection_size_bytes: int = None

@dataclass
class DatabaseCollectionsConfiguration:
    sensor_data: CollectionConfiguration
    events: CollectionConfiguration
    frontend_messages: CollectionConfiguration
    io_state: CollectionConfiguration
    digital_input_state: CollectionConfiguration
    analog_input_state: CollectionConfiguration
    hardware_configuration: CollectionConfiguration
    ui_configuration: CollectionConfiguration
    axis_state: CollectionConfiguration

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
    batch_insertion_size: int
    host: str
    port: int
    username: str
    password: str
    database_name: str
    drop_database_on_start: bool = False
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
    database: MongoConfiguration

##########################################################
#################### IO CONFIGURATION ####################
##########################################################

class IOPointType(Enum):
    DIGITAL_INPUT = auto()
    DIGITAL_OUTPUT = auto()
    ANALOG_INPUT = auto()
    ANALOG_OUTPUT = auto()
    # ANALOG_VOLTAGE_INPUT = auto()
    # ANALOG_VOLTAGE_OUTPUT = auto()
    # ANALOG_CURRENT_INPUT = auto()
    # ANALOG_CURRENT_OUTPUT = auto()

class AnalogIOPointType(Enum):
    VOLTAGE = 0
    CURRENT = 1

class TransferFunctionType(Enum):
    LINEAR = auto()
    CUSTOM = auto()

@dataclass
class ROSIOPointConfiguration:
    channel: int | None
    label: str = None
    configured: bool = False
    enabled: bool = False
    type: IOPointType = None
    analog_type: AnalogIOPointType = None
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
    analog_inputs: Annotated[List[ROSIOPointConfiguration], 3]
    analog_outputs: Annotated[List[ROSIOPointConfiguration], 3]

@dataclass
class HardwareConfiguration:
    io_system: IOSystemConfiguration

    number_of_digital_inputs: ClassVar[int] = 8
    number_of_digital_outputs: ClassVar[int] = 8
    number_of_analog_inputs: ClassVar[int] = 3
    number_of_analog_outputs: ClassVar[int] = 3

    @staticmethod
    def parse(serialized_configuration: Dict) -> "HardwareConfiguration":
        digital_inputs = serialized_configuration['io_system']['digital_inputs']
        digital_outputs = serialized_configuration['io_system']['digital_outputs']
        analog_inputs = serialized_configuration['io_system']['analog_inputs']
        analog_outputs = serialized_configuration['io_system']['analog_outputs']
        return HardwareConfiguration(
            io_system=IOSystemConfiguration(
                digital_inputs=[ROSIOPointConfiguration(**di) for di in digital_inputs],
                digital_outputs=[ROSIOPointConfiguration(**do) for do in digital_outputs],
                analog_inputs=[ROSIOPointConfiguration(**ai) for ai in analog_inputs],
                analog_outputs=[ROSIOPointConfiguration(**ai) for ai in analog_outputs]
            )
        )
    
    @staticmethod
    def default_configuration() -> "HardwareConfiguration":
        digital_inputs = [
            # ROSIOPointConfiguration(channel=x, type=IOPointType.DIGITAL_INPUT)
            ROSIOPointConfiguration(channel=None, type=IOPointType.DIGITAL_INPUT)
            for x in range(HardwareConfiguration.number_of_digital_inputs)
        ]

        digital_outputs = [
            # ROSIOPointConfiguration(channel=x, type=IOPointType.DIGITAL_OUTPUT)
            ROSIOPointConfiguration(channel=None, type=IOPointType.DIGITAL_OUTPUT)
            for x in range(HardwareConfiguration.number_of_digital_outputs)
        ]

        analog_inputs = [
            # ROSIOPointConfiguration(channel=x, type=IOPointType.ANALOG_INPUT)
            ROSIOPointConfiguration(channel=None, type=IOPointType.ANALOG_INPUT)
            for x in range(HardwareConfiguration.number_of_analog_inputs)
        ]

        analog_outputs = [
            # ROSIOPointConfiguration(channel=x, type=IOPointType.ANALOG_OUTPUT)
            ROSIOPointConfiguration(channel=None, type=IOPointType.ANALOG_OUTPUT)
            for x in range(HardwareConfiguration.number_of_analog_inputs)
        ]

        return HardwareConfiguration(
            io_system=IOSystemConfiguration(
                digital_inputs=digital_inputs,
                digital_outputs=digital_outputs,
                analog_inputs=analog_inputs,
                analog_outputs=analog_outputs
            )
        )
    
    def serialize(self) -> Dict:
        return asdict(self, dict_factory=hardware_configuration_dict_factory)