from datetime import datetime

from typing import (
    Dict,
    Any
)

from database.models import (
    DocumentType,
    MongoTimeseriesRecord,
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