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
from functools import singledispatch
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
from backend.ra_hardware_interface.models import (
    IOSystem,
    Sensors
)
from backend.frontend.models import (
    FrontendMessage
)
from backend.utils.utils import (
    timeseries_record_dict_factory
)
from backend.config.models import (
    DocumentType,
    HardwareConfiguration,
)
from backend.api.models import UIConfiguration

class MongoInterfaceException(Exception):
    pass

class MongoLocalInterfaceException(Exception):
    pass

class MongoCloudInterfaceException(Exception):
    pass

class DatabaseCommandType(Enum):
    GET_DOCUMENTS = auto()
    GET_AXIS_DOCUMENTS = auto()
    GET_DATA_POINTS = auto()
    GET_IO_DATA_POINTS = auto()
    GET_MESSAGES = auto()

@dataclass
class DatabaseCommand:
    document_type: DocumentType
    number_of_documents: int
    
    command_type: Optional[DatabaseCommandType] = None
    axis_index: Optional[int] = None

RecordType = TypeVar("RecordType")

def mongo_record_deserializer(record: Dict, record_class: RecordType) -> RecordType:
    input = {'data': {}}
    for k, v in record.items():
        if k == 'metadata':
            input[k] = TimeseriesMetadata.deserialize_from_dict(v)
        elif k not in [f.name for f in fields(record_class)]:
            input['data'][k] = v
        else:
            input[k] = v
    return record_class(**input)

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
            else:
                input[k] = v
        return TimeseriesMetadata(**input)

@dataclass
class MongoTimeseriesRecord:
    metadata: TimeseriesMetadata
    timestamp: datetime
    data: InitVar[Dict[str, Any] | "DataRecordContainerType"]

    _id: Optional[str] = None
    timestamp_seconds: Optional[float] = None
    record_hash: Optional[str] = None

    def __post_init__(self, data: Dict[str, Any]):
        if is_dataclass(data):
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

    @staticmethod
    def deserialize_from_dict(record: Dict) -> "MongoTimeseriesRecord":
        return mongo_record_deserializer(record=record, record_class=MongoTimeseriesRecord)

    # @singledispatch
    # def keys_to_strings(self, ob):
    #     return ob

    # @keys_to_strings.register
    # def _handle_dict(self, ob: dict):
    #     return {str(k): self.keys_to_strings(v) for k, v in ob.items()}

    # @keys_to_strings.register
    # def _handle_list(self, ob: list):
    #     return [self.keys_to_strings(v) for v in ob]

    @property
    def formatted_data_dict(self) -> Dict:
        return json.loads(json.dumps(self._data_dict))

    def serialize_to_dict(self) -> Dict[str, Any]:
        sparse_metadata = asdict(self.metadata, dict_factory=timeseries_record_dict_factory)
        serialized = {**asdict(self, dict_factory=timeseries_record_dict_factory), **self.formatted_data_dict, 'record_hash': self.record_hash}
        serialized['metadata'] = sparse_metadata
        return serialized

@dataclass
class MongoAxisTimeseriesRecord(MongoTimeseriesRecord):
    axis_index: int = None

@dataclass
class TimeseriesRecordContainer:
    records: List[MongoTimeseriesRecord]

    def serialize(self):
        return [
            r.serialize_to_dict() for r in self.records
        ]

@dataclass
class DatabaseRecordDataContainer:
    def serialize(self) -> Dict[str, Any]:
        return asdict(self, dict_factory=timeseries_record_dict_factory)

##########################################################
#################### DATA POINT TYPES ####################
##########################################################

@dataclass
class IOSystemDataContainer(DatabaseRecordDataContainer):
    io_system: IOSystem
    
DataRecordContainerType = TypeVar("DataRecordContainerType", bound=IOSystemDataContainer)

##########################################################
###################### RECORD TYPES ######################
##########################################################

@dataclass
class IOStateRecord(MongoTimeseriesRecord):
    data: InitVar[IOSystem]

@dataclass
class AxisStateRecord(MongoAxisTimeseriesRecord):
    data: InitVar[Dict]

@dataclass
class FrontendMessageRecord(MongoTimeseriesRecord):
    data: InitVar[FrontendMessage]

@dataclass
class HardwareConfigurationRecord(MongoTimeseriesRecord):
    data: InitVar[HardwareConfiguration]

    @staticmethod
    def deserialize_from_dict(record: Dict) -> "HardwareConfigurationRecord":
        return mongo_record_deserializer(record=record, record_class=HardwareConfigurationRecord)
        # return MongoTimeseriesRecord.deserialize_from_dict(record)

    @property
    def hardware_configuration(self) -> HardwareConfiguration:
        return HardwareConfiguration.parse(self.data_dictionary)

@dataclass
class UIConfigurationRecord(MongoTimeseriesRecord):
    data: InitVar[UIConfiguration]

    @staticmethod
    def deserialize_from_dict(record: Dict) -> "UIConfigurationRecord":
        return mongo_record_deserializer(record=record, record_class=UIConfigurationRecord)
        # return MongoTimeseriesRecord.deserialize_from_dict(record)

    @property
    def ui_configuration(self) -> UIConfiguration:
        return UIConfiguration(**self.data_dictionary)

@dataclass
class SensorDataRecord(MongoTimeseriesRecord):
    data: InitVar[Sensors]

##########################################################
######################## ROS TYPES #######################
##########################################################


