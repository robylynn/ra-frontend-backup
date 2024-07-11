import time

from loguru import logger
from dataclasses import dataclass
from datetime import datetime
from threading import Thread
from typing import (
    Union,
    Any,
    Dict,
    ClassVar
)

from database.interface import MongoInterface
# import database.models as database_models
from database.models import (
    MongoTimeseriesRecord,
    DocumentType,
    TimeseriesMetadata,
    IOSystemDataContainer,
    # IOPointData,
    FrontendMessage,
    # MessageSeverity
)
from frontend.models import (
    MessageSeverity
)
from ra_hardware_interface.models import (
    IOSystem,
    Sensors
)
from config.models import (
    HardwareConfiguration
)

@dataclass
class RAInterface(Thread):
    database: MongoInterface
    
    hardware_configuration: ClassVar[HardwareConfiguration] = None

    # _io_configuration_loaded: ClassVar[bool] = False
    sensors: ClassVar[Sensors] = None
    io_system: ClassVar[IOSystem] = None
    _hardware_configuration_loaded: ClassVar[bool] = False

    def __post_init__(self):
        super(RAInterface, self).__init__()
        # self.io_system = IOSystem()

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

    def load_io_system_configuration(self):
        configuration = self.database.get_latest_system_configuration()
        if configuration is None:
            self.hardware_configuration = HardwareConfiguration.default_configuration()
        else:
            self.hardware_configuration = configuration
        self._hardware_configuration_loaded = True

        self.io_system = IOSystem(configuration=self.hardware_configuration.io_system)
        self.sensors = Sensors(sensors=[])
    
    def add_sensor(self, sensor_name: str):
        self.sensors.add_sensor(
            sensor_name=sensor_name
        )
        # self._sensors[sensor_name] = Sensor(
        #     name=sensor_name
        # )
        # try:
        #     # io_points = self.database.get_io_data_points(number_of_points=1, timeout=1)
        #     # io_system = IOSystem.load_configuration(self.database.get_io_data_points(number_of_points=1, timeout=1)[0].data_dictionary)
        #     self.io_system = IOSystem.load_configuration(self.database.get_io_data_points(number_of_points=1, timeout=1)[0].data_dictionary)
        #     self._io_configuration_loaded = True
        #     logger.info(f"Loaded new IO configuration.")
        # except Exception as e:
        #     logger.error(f"Error loading IO system configuration: {e}. Defaulting to base configuration.")
    
    def run(self):
        while True:
            # if not self._io_configuration_loaded:
            #     self.load_io_system_configuration()

            if not self._hardware_configuration_loaded:
                self.load_io_system_configuration()
                self.add_sensor('temperature_sensor')
                self.sensors._sensors['temperature_sensor'].state = 5
                # configuration = self.database.get_latest_system_configuration()
                # if configuration is None:
                #     self.hardware_configuration = HardwareConfiguration.default_configuration()
                # else:
                #     self.hardware_configuration = configuration
                # self._hardware_configuration_loaded = True

                # self.io_system = IOSystem(configuration=self.hardware_configuration.io_system)
            
            # self.database.enqueue_record(
            #     data=self._create_database_document(
            #         document_type=DocumentType.SYSTEM_CONFIGURATION,
            #         data=self.hardware_configuration.serialize()
            #     )
            # )


            time.sleep(2)

            self.database.enqueue_record(
                data=self._create_database_document(
                    document_type=DocumentType.IO_STATE,
                    data=self.io_system.serialize()
                )
            )

            self.database.enqueue_record(
                data=self._create_database_document(
                    document_type=DocumentType.FRONTEND_MESSAGE,
                    data=FrontendMessage(
                        message="test_message",
                        severity=MessageSeverity.ERROR
                    ).serialize()
                )
            )
            
            self.io_system.digital_inputs.points[4].state = True

            # self.add_sensor('temperature_sensor')

            # self.sensors['temperature_sensor'] = Sensor(
            #     name='temperature_sensor',
            #     state=5
            # )
            # self.sensors._sensors['temperature_sensor'].state = 5

            self.database.enqueue_record(
                data=self._create_database_document(
                    document_type=DocumentType.SENSOR_DATA,
                    data=self.sensors.serialize()
                )
            )

            self.sensors._sensors['temperature_sensor'].state += 1

            if False:
                for point in self.io_system.digital_outputs.points:
                    if point is not None:
                        logger.info(f"Toggling digital output {point.index}")
                        point.state = not point.state

                logger.info(f"Writing demo database IO record")
                self.database.enqueue_io_state(
                    self._create_database_document(
                        document_type=DocumentType.IO_STATE,
                        data=IOSystemDataContainer(
                            io_system=self.io_system
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
            