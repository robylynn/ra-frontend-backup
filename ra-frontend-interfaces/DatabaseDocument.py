from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


class DocumentType(Enum):
    ANALOG_INPUT_STATE = "ANALOG_INPUT_STATE"
    AXIS_STATE = "AXIS_STATE"
    DIGITAL_INPUT_STATE = "DIGITAL_INPUT_STATE"
    EVENT = "EVENT"
    FRONTEND_MESSAGE = "FRONTEND_MESSAGE"
    IO_STATE = "IO_STATE"
    SENSOR_DATA = "SENSOR_DATA"
    SYSTEM_CONFIGURATION = "SYSTEM_CONFIGURATION"
    UI_CONFIGURATION = "UI_CONFIGURATION"


@dataclass
class DocumentMetadata:
    """metadata"""

    commit_serial_number: int
    document_type: DocumentType
    machine_startup_time: datetime
    machine_uid: str
    experiment_id: Optional[str] = None
    plan_id: Optional[str] = None


@dataclass
class DatabaseDocument:
    """Timeseries Record in mongoDB"""

    id: str
    metadata: DocumentMetadata
    record_hash: str
    timestamp: datetime
    timestamp_seconds: float
