from datetime import datetime

from typing import (
    Dict,
    Any
)

from database.models import (
    DocumentType,
    MongoTimeseriesRecord,
    MongoAxisTimeseriesRecord,
    TimeseriesMetadata
)

def create_database_document(timestamp: float, document_type: DocumentType, data: Dict[str, Any]) -> MongoTimeseriesRecord:
    return MongoTimeseriesRecord(
        metadata=TimeseriesMetadata(
            machine_uid="ra_demo",
            commit_serial_number=-1,
            machine_startup_time=datetime.now(),
            document_type=document_type
        ),
        # timestamp=datetime.utcnow(),
        timestamp=datetime.fromtimestamp(timestamp),
        data=data
    )

def create_database_axis_document(timestamp: float, axis_index: int, data: Dict[str, Any]) -> MongoAxisTimeseriesRecord:
    return MongoAxisTimeseriesRecord(
        metadata=TimeseriesMetadata(
            machine_uid="ra_demo",
            commit_serial_number=-1,
            machine_startup_time=datetime.now(),
            document_type=DocumentType.AXIS_STATE
        ),
        # timestamp=datetime.utcnow(),
        axis_index=axis_index,
        timestamp=datetime.fromtimestamp(timestamp),
        data=data
    )