#!/usr/bin/env python3

## RA Backend
### MongoDB Database Models
### Developed by R2 Labs

import hashlib, json

from dataclasses import (
    dataclass,
    asdict,
    InitVar,
    fields,
    is_dataclass
)
from datetime import datetime
from typing import (
    ClassVar, 
    Dict, 
    Any, 
    Union, 
    List,
    Optional,
    TypeVar
)
from enum import (
    Enum,
    auto
)
# from dacite import (
#     from_dict, 
#     Config
# )
from ra_hardware_interface.models import (
    IOSystem,
    # IOPointType,
    # TransferFunctionType
)
from frontend.models import (
    MessageSeverity
)
from utils.utils import (
    timeseries_record_dict_factory
)
from config.models import (
    DocumentType
)

class MongoInterfaceException(Exception):
    pass

class MongoLocalInterfaceException(Exception):
    pass

class MongoCloudInterfaceException(Exception):
    pass

class DatabaseCommandType(Enum):
    GET_DATA_POINTS = auto()
    GET_IO_DATA_POINTS = auto()
    GET_MESSAGES = auto()

class MessageSeverity(Enum):
    DEBUG = auto()
    INFO = auto()
    WARNING = auto()
    ERROR = auto()

@dataclass
class DatabaseCommand:
    command_type: DatabaseCommandType
    number_of_points: int = None
    number_of_messages: int = None

# @dataclass
# class MongoInstanceConfiguration:
#     enabled: bool
#     connection_timeout_ms: int
#     server_selection_timeout_ms: int
#     socket_timeout_ms: int
#     cycle_count_before_yield: int
#     host: str
#     port: int
#     username: str
#     password: str
#     database_name: str
#     data_timeseries_collection: str
#     event_timeseries_collection: str
#     frontend_message_collection: str = None
#     io_state_collection: str = None
#     drop_database_on_start: bool = False
#     drop_collection_on_start: bool = False
#     # use_frontend_message_collection: bool = False
#     frontend_message_collection_size_bytes: int = 1000
#     io_state_collection_size_bytes: int = 1000

# @dataclass
# class MongoConfiguration:
#     database_synchronization_period_sec: int
#     synchronization_batch_size: int
#     queue_length_warning_threshold: int
#     queue_get_timeout_secs: float

#     local: MongoInstanceConfiguration
#     cloud: MongoInstanceConfiguration

@dataclass
class TimeseriesMetadata:
    machine_uid: str
    commit_serial_number: int
    machine_startup_time: datetime
    document_type: DocumentType

    @staticmethod
    def deserialize_from_dict(metadata: Dict) -> "TimeseriesMetadata":
        input = {}
        for k, v in metadata.items():
            if k == 'document_type':
                input[k] = getattr(DocumentType, v)
            # elif k == 'machine_startup_time':
            #     input[k] = datetime.fromisoformat(v)
            else:
                input[k] = v
        return TimeseriesMetadata(**input)
    # experiment_id: str = None
    # plan_id: str = None

@dataclass
class MongoTimeseriesRecord:
    metadata: TimeseriesMetadata
    timestamp: datetime
    data: InitVar[Dict[str, Any] | "DataRecordContainerType"]

    _id: Optional[str] = None
    timestamp_seconds: Optional[float] = None
    # record_hash: ClassVar[str] = None
    record_hash: Optional[str] = None
    

    def __post_init__(self, data: Dict[str, Any]):
        if is_dataclass(data):
            # self._data_dict = {k: v for k, v in data.serialize().items()}    
            data = data.serialize()
        
        self._data_dict = {k: v for k, v in data.items()}
        self.timestamp_seconds = self.timestamp.timestamp()
        self.record_hash = self.create_hash(self.attribute_dictionary)

    @property
    def attribute_dictionary(self) -> Dict[str, Any]:
        return {**asdict(self), **self._data_dict}

    @property
    def data_dictionary(self) -> Dict[str, Any]:
        return self._data_dict

    def create_hash(self, attrs: Dict) -> str:
        hash = hashlib.md5(
            json.dumps(attrs, default=str).encode()
        ).hexdigest()
        
        return hash

    # @classmethod
    # def construct_from_database_record(record: Dict):
    #     return 

    @staticmethod
    def deserialize_from_dict(record: Dict) -> "MongoTimeseriesRecord":
        input = {'data': {}}
        for k, v in record.items():
            if k == 'metadata':
                input[k] = TimeseriesMetadata.deserialize_from_dict(v)
            # elif k == 'timestamp':
            #     input[k] = datetime.fromisoformat(v)
            # elif k not in ['timestamp', 'timestamp_seconds', 'record_hash', '_id']:
            elif k not in [f.name for f in fields(MongoTimeseriesRecord)]:
                input['data'][k] = v

            else:
                input[k] = v
        return MongoTimeseriesRecord(**input)
        # return from_dict(data_class=MongoTimeseriesRecord, data=record, config=Config(cast=[DocumentType]))

    def serialize_to_dict(self) -> Dict[str, Any]:
        sparse_metadata = asdict(self.metadata, dict_factory=timeseries_record_dict_factory)
        serialized = {**asdict(self, dict_factory=timeseries_record_dict_factory), **self._data_dict, 'record_hash': self.record_hash}
        serialized['metadata'] = sparse_metadata
        return serialized

@dataclass
class TimeseriesRecordContainer:
    records: List[MongoTimeseriesRecord]

    def serialize(self):
        return [
            r.serialize_to_dict() for r in self.records
        ]

@dataclass
class MongoFrontendMessage:
    severity: MessageSeverity
    message: str

    def serialize_to_database_record(self) -> Dict[str, Any]:
        return asdict(self, dict_factory=timeseries_record_dict_factory)

@dataclass
class DatabaseRecordDataContainer:
    def serialize(self) -> Dict[str, Any]:
        return asdict(self, dict_factory=timeseries_record_dict_factory)

##########################################################
#################### DATA POINT TYPES ####################
##########################################################

# @dataclass
# class DatabaseDataPoint:
#     def serialize(self) -> Dict:
#         return asdict(self)

@dataclass
class IOPointData(DatabaseRecordDataContainer):
    point_index: int
    state: Union[bool, float]

    # def serialize(self) -> Dict:
    #     return asdict(self)

@dataclass
class FrontendMessage(DatabaseRecordDataContainer):
    message: str
    severity: MessageSeverity


# @dataclass
# class IOPointDataContainer(DatabaseRecordDataContainer):
#     io_points: List[IOPointData]

@dataclass
class IOSystemDataContainer(DatabaseRecordDataContainer):
    io_system: IOSystem
    # io_system_state: InitVar[IOSystem]

    # io_system: Dict = None

    # def __post_init__(self, io_system: IOSystem):
    #     self.io_system = io_system.serialize()
    # def serialize(self) -> Dict:
    #     return asdict(self)

# @dataclass
# class ROSIOPointConfiguration:
#     label: str
#     channel: int
#     type: IOPointType
#     transfer_function_type: TransferFunctionType
#     measurement_unit: str
#     min_value: float
#     min_signal_v: float
#     max_value: float
#     max_signal_v: float

#     transfer_function_callback: str = None

# @dataclass
# class FrontendMessagesContainer(DatabaseRecordDataContainer):
#     messages: List[FrontendMessage]
DataRecordContainerType = TypeVar("DataRecordContainerType", bound=IOSystemDataContainer)

##########################################################
###################### RECORD TYPES ######################
##########################################################

@dataclass
class IOStateRecord(MongoTimeseriesRecord):
    # data: InitVar["IOSystem"]
    # io_system: Dict
    pass
    # @property
    # def data_dictionary(self) -> Dict:
    #     return self._data_dict

@dataclass
class FrontendMessageRecord(MongoTimeseriesRecord):
    data: InitVar[FrontendMessage]

##########################################################
######################## ROS TYPES #######################
##########################################################


