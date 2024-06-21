import time

from loguru import logger
from dataclasses import dataclass
from datetime import datetime
from threading import Thread
from typing import (
    Union,
    Any,
    Dict
)

from database.interface import MongoInterface
# import database.models as database_models
from database.models import (
    MongoTimeseriesRecord,
    DocumentType,
    TimeseriesMetadata,
    IOPointDataContainer,
    IOPointData,
    FrontendMessage,
    MessageSeverity
)

@dataclass
class RAInterface(Thread):
    database: MongoInterface

    def __post_init__(self):
        super(RAInterface, self).__init__()

    def __hash__(self) -> int:
        return hash((self.name))
    
    def _create_database_document(self, document_type: DocumentType, data: Dict[str, Any]) -> MongoTimeseriesRecord:
        return MongoTimeseriesRecord(
            metadata=TimeseriesMetadata(
                machine_uid="ra_demo",
                commit_serial_number=-1,
                machine_startup_time=datetime.now(),
                # experiment_id=self._operational_state.experiment_id,
                # plan_id=self._operational_state.plan_id,
                document_type=document_type
            ),
            timestamp=datetime.utcnow(),
            data=data
        )

    def run(self):
        while True:
            time.sleep(2)
            logger.info(f"Writing demo database record")
            self.database.enqueue_io_state(
                self._create_database_document(
                    document_type=DocumentType.IO_STATE,
                    data=IOPointDataContainer(
                        io_points=[
                            IOPointData(
                                point_index=0,
                                state=False
                            ),
                            IOPointData(
                                point_index=1,
                                state=False
                            )
                        ]
                    ).serialize()
                )
            )

            logger.info(f"Writing demo database message")
            self.database.enqueue_message(
                self._create_database_document(
                    document_type=DocumentType.FRONTEND_MESSAGE,
                    data=FrontendMessage(
                        message="test message",
                        severity=MessageSeverity.ERROR
                    ).serialize()
                )
                    # IOPointDataContainer(
                    #     io_points=[
                    #         IOPointData(
                    #             point_index=0,
                    #             state=False
                    #         ),
                    #         IOPointData(
                    #             point_index=1,
                    #             state=False
                    #         )
                    #     ]
            )
            