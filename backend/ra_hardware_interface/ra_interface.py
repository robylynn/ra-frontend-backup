import time

from loguru import logger
from dataclasses import dataclass
from datetime import datetime
from threading import Thread
from typing import Any, Dict, ClassVar

from backend.database.interface import MongoInterface

from backend.database.models import (
    MongoTimeseriesRecord,
    DocumentType,
    TimeseriesMetadata,
    FrontendMessage,
)
from backend.frontend.models import MessageSeverity
from backend.ra_hardware_interface.models import IOSystem, Sensors
from backend.config.models import HardwareConfiguration


@dataclass
class RAInterface(Thread):
    database: MongoInterface

    hardware_configuration: ClassVar[HardwareConfiguration] = None

    sensors: ClassVar[Sensors] = None
    io_system: ClassVar[IOSystem] = None
    _hardware_configuration_loaded: ClassVar[bool] = False

    def __post_init__(self):
        super(RAInterface, self).__init__()

    def __hash__(self) -> int:
        return hash((self.name))

    def _create_database_document(
        self, document_type: DocumentType, data: Dict[str, Any]
    ) -> MongoTimeseriesRecord:
        return MongoTimeseriesRecord(
            metadata=TimeseriesMetadata(
                machine_uid="ra_demo",
                commit_serial_number=-1,
                machine_startup_time=datetime.now(),
                document_type=document_type,
            ),
            timestamp=datetime.utcnow(),
            data=data,
        )

    def load_io_system_configuration(self):
        configuration = self.database.get_latest_system_configuration()
        if configuration is None:
            self.hardware_configuration = HardwareConfiguration.default_configuration()
            self.save_system_configuration()
        else:
            self.hardware_configuration = configuration
        self._hardware_configuration_loaded = True

        self.io_system = IOSystem(configuration=self.hardware_configuration.io_system)
        self.sensors = Sensors(sensors=[])

    def save_system_configuration(self):
        self.database.enqueue_record(
            data=self._create_database_document(
                document_type=DocumentType.SYSTEM_CONFIGURATION,
                data=self.hardware_configuration.serialize(),
            )
        )

    def add_sensor(self, sensor_name: str):
        self.sensors.add_sensor(sensor_name=sensor_name)

    def run(self):
        while True:
            # TODO Add ros subscriptions here

            if not self._hardware_configuration_loaded:
                self.load_io_system_configuration()
                # self.add_sensor('temperature_sensor')
                # self.sensors._sensors['temperature_sensor'].state = 5

            if False:
                if not self._hardware_configuration_loaded:
                    self.load_io_system_configuration()
                    self.add_sensor("temperature_sensor")
                    self.sensors._sensors["temperature_sensor"].state = 5

                time.sleep(2)

                self.database.enqueue_record(
                    data=self._create_database_document(
                        document_type=DocumentType.IO_STATE,
                        data=self.io_system.serialize(),
                    )
                )

                self.database.enqueue_record(
                    data=self._create_database_document(
                        document_type=DocumentType.FRONTEND_MESSAGE,
                        data=FrontendMessage(
                            message="test_message", severity=MessageSeverity.ERROR
                        ).serialize(),
                    )
                )

                self.io_system.digital_inputs.points[4].state = True

                self.database.enqueue_record(
                    data=self._create_database_document(
                        document_type=DocumentType.SENSOR_DATA,
                        data=self.sensors.serialize(),
                    )
                )

                self.sensors._sensors["temperature_sensor"].state += 1
            time.sleep(1)
