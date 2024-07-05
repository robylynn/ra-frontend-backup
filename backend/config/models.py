from dataclasses import (
    dataclass,
    asdict,
    fields
)

from typing import (
    List,
    Dict,
    Generator,
    Tuple
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
# from ra_hardware_interface.models import (
#     IOPointType
# )

# @dataclass
# class NetworkDevice:
#     name: str
#     customer: str
#     IP: str

#     def dump_json(self) -> Dict:
#         return asdict(self)

@dataclass
class CollectionConfiguration:
    name: str
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
    label: str
    channel: int
    type: IOPointType
    transfer_function_type: TransferFunctionType
    measurement_unit: str
    min_value: float
    min_signal_v: float
    max_value: float
    max_signal_v: float

    transfer_function_callback: str = None

@dataclass
class IOSystemConfiguration:
    digital_inputs: List[ROSIOPointConfiguration]