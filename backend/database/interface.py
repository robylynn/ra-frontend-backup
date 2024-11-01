#!/usr/bin/env python3

## RA Backend
### MongoDB Database Interface
### Developed by R2 Labs

import time, os, traceback

from typing import (
    ClassVar,
    Tuple,
    List,
    Union,
    Generator
)

from dataclasses import (
    dataclass, 
    InitVar,
    fields
)

from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.database import Database
from pymongo.collection import Collection
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure, AutoReconnect
from queue import Empty
from multiprocessing import (
    Process,
    Value,
    Queue as mpQueue,
    Pipe,
    Lock
)
from multiprocessing.connection import Connection

from threading import Thread
from datetime import datetime

from database.models import (
    MongoInterfaceException,
    MongoCloudInterfaceException,
    MongoLocalInterfaceException,
    MongoTimeseriesRecord,
    TimeseriesRecordContainer,
    MongoInterfaceException,
    DatabaseCommand,
    DatabaseCommandType,
    IOStateRecord,
    FrontendMessageRecord,
    HardwareConfigurationRecord,
    UIConfigurationRecord,
    IOStateRecord,
    AxisStateRecord,
    SensorDataRecord,
    DocumentType
)

from config.models import (
    MongoConfiguration,
    MongoInstanceConfiguration,
    DatabaseCollectionsConfiguration,
    HardwareConfiguration,
)

from api.models import (
    UIConfiguration
)

from loguru import logger

@dataclass
class DatabaseInstance:
    configuration: MongoInstanceConfiguration
    collections_configuration: DatabaseCollectionsConfiguration
    
    shm_connection_alive: Value = None
    collections_initialized: bool = False
    
    _client: ClassVar[MongoClient] = None
    _database: ClassVar[Database] = None

    def __post_init__(self):
        self.shm_connection_alive = Value('i', 0)

        for collection_name, collection_configuration in self.collections_configuration.database_collection_generator:
            setattr(self, self.collection_attribute_name(collection_name), None)

    @staticmethod
    def collection_attribute_name(collection_name: str) -> str:
        return ''.join(["_", collection_name, "_collection"])

    @property
    def connection_alive(self) -> bool:
        return self.shm_connection_alive.value != 0
    
    @connection_alive.setter
    def connection_alive(self, value: bool) -> None:
        self.shm_connection_alive.value = 1 if value else 0

    def _connect(self) -> None:
        try:
            logger.info(f"Connecting to mongodb instance on {self.configuration.host}:{self.configuration.port}")

            self._client = MongoClient(
                host=self.configuration.host,
                port=self.configuration.port,
                connectTimeoutMS=self.configuration.connection_timeout_ms,
                serverSelectionTimeoutMS=self.configuration.server_selection_timeout_ms,
                socketTimeoutMS=self.configuration.socket_timeout_ms,
                username=self.configuration.username,
                password=self.configuration.password,
                authSource=self.configuration.database_name,
                directConnection=True
            )

            # Ping the db to make sure it is available
            self._client.admin.command("ping")
            self.connection_alive = True
            logger.success(f"Successfully connected to mongoDB instance on {self.configuration.host}:{self.configuration.port}")

            self._database = getattr(self._client, self.configuration.database_name)
            logger.info(f"Using database: {self.configuration.database_name}")

            if not self.collections_initialized:
                if not self.configuration.drop_database_on_start:
                    self._create_ra_timeseries_collections()
                else:
                    self._drop_database()
                    self._create_ra_timeseries_collections()
                    self._create_users()
                
                self.collections_initialized = True

        except ServerSelectionTimeoutError as e:
            self._client = None
            raise MongoInterfaceException(f"Timed out connecting to mongoDB instance {self.configuration.host}, received error: {e}")
        except Exception as e:
            self._client = None
            raise MongoInterfaceException(f"Exception connecting to mongoDB instance {self.configuration.host}, received error: {e}. Traceback: {traceback.format_exc()}")
    
    def ping_database(self) -> bool:
        try:
            self._client.admin.command("ping")
            return True
        except Exception as e:
            return False
    
    def _drop_database(self):
        logger.warning(f"Dropping database {self.configuration.database_name}")
        self._client.drop_database(self.configuration.database_name)

    def _create_users(self):
        try:
            self._database.command(
                "createUser",
                self.configuration.username,
                pwd=self.configuration.password,
                roles=["dbAdmin"]
            )

        except OperationFailure:
            logger.info(f"{self.configuration.username} already exists on {self.configuration.database_name}")
        
        try:
            self._database.command(
                "createUser",
                "data_reader",
                pwd=self.configuration.password,
                roles=[{"role": "read", "db": self.configuration.database_name}]
            )

        except OperationFailure:
            logger.info(f"data_reader user already exists on {self.configuration.database_name}")
    
    def _create_ra_timeseries_collections(self) -> List[Collection]:
        for collection_name, collection_configuration in self.collections_configuration.database_collections.items():
            if os.environ.get("CONTAINERIZED").lower() == "true":
                host_hostname = os.environ.get("HOST_HOSTNAME")
                stored_collection_name = "_".join([collection_name, host_hostname, os.uname()[1]])
            else:
                stored_collection_name = "_".join([collection_name, os.uname()[1]])
                
            if stored_collection_name in self._database.list_collection_names() and collection_configuration.drop_on_start:
                self._database.drop_collection(stored_collection_name)

            if stored_collection_name not in self._database.list_collection_names():
                logger.info(f"Timeseries collection {stored_collection_name} does not exist, creating...")
                kwargs = dict(
                    name=stored_collection_name,
                    timeseries={
                        'timeField': 'timestamp',
                        'metaField': 'metadata',
                        'granularity': 'seconds'
                    } if not collection_configuration.capped else None,
                    capped=collection_configuration.capped,
                    size=collection_configuration.collection_size_bytes if collection_configuration.capped else None
                )
                collection = self._database.create_collection(
                    **{k:v for k, v in kwargs.items() if v is not None}
                )
            else:
                collection = getattr(self._database, stored_collection_name)
            
            setattr(self, self.collection_attribute_name(collection_name), collection)

    def get_collection(self, document_type: DocumentType) -> Collection:
        for collection_name, collection_configuration in self.collections_configuration.database_collection_generator:
            if collection_configuration.document_type == document_type:
                return getattr(self, self.collection_attribute_name(collection_name=collection_name))

@dataclass
class MongoInterfaceState:
    collections_configuration: InitVar[DatabaseCollectionsConfiguration]
    local_configuration: InitVar[MongoInstanceConfiguration]
    cloud_configuration: InitVar[MongoInstanceConfiguration]

    local: ClassVar[DatabaseInstance] = None
    cloud: ClassVar[DatabaseInstance] = None

    def __post_init__(self, collections_configuration: DatabaseCollectionsConfiguration, local_configuration: MongoInstanceConfiguration, cloud_configuration: MongoInstanceConfiguration):
        self.local = DatabaseInstance(configuration=local_configuration, collections_configuration=collections_configuration)
        self.cloud = DatabaseInstance(configuration=cloud_configuration, collections_configuration=collections_configuration)

@dataclass
class DatabaseQueue:
    name: str
    timeout_secs: int
    document_type: DocumentType
    parent_container: "RADatabaseQueues"

    _queue: ClassVar["mpQueue[MongoTimeseriesRecord]"] = None#mpQueue()
    _last_synchronization_time: ClassVar[float] = 0.0
    _commit_serial_number: ClassVar[int] = 0

    def __post_init__(self):
        self._queue = mpQueue()

    @property
    def empty(self) -> bool:
        return self._queue.empty()
    
    @property
    def qsize(self) -> int:
        return self._queue.qsize()
    
    def get(self) -> MongoTimeseriesRecord:
        return self._queue.get(timeout=self.timeout_secs)
    
    def get_nowait(self) -> MongoTimeseriesRecord:
        return self._queue.get_nowait()
    
    def put(self, document: MongoTimeseriesRecord):
        self._queue.put(document)
    
    def insert_document_locally(self, document: MongoTimeseriesRecord):
        target_collection = self.parent_container.interface_state.local.get_collection(document_type=self.document_type)
        if document.metadata.document_type != self.document_type:
            raise MongoInterfaceException(f"Wrong document type {document.metadata.document_type} given to database queue for {self.document_type}")

        document.metadata.commit_serial_number = self._commit_serial_number
        local_insertion_result = target_collection.insert_one(document.serialize_to_dict())
        self._commit_serial_number += 1

        if not local_insertion_result.acknowledged:
            logger.error(f"Queue {self.name} failed to insert record for machine {document.metadata.machine_uid} with timestamp {document.timestamp} into local collection")
            raise MongoInterfaceException
    
    def synchronize_databases(self, batch_size: int):
        # TODO Implement later
        try:
            latest_local_record = self.target_local_collection.find().sort("timestamp", DESCENDING)[0]
        except IndexError as e:
            # No data in local database
            return
        except Exception as e:
            raise MongoLocalInterfaceException("Not connected to local database")

        try:
            start_time = time.time()

            try:
                self.target_remote_collection.create_index([("timestamp", DESCENDING)], name="timestamp_index")
            except Exception as e:
                logger.warning(f"Error creating timestamp index on remote database")

            latest_cloud_record = self.target_remote_collection.find().sort("timestamp", DESCENDING)[0]
            latest_cloud_timestamp = latest_cloud_record["timestamp"]
        except IndexError:
            document_count = self.target_local_collection.estimated_document_count()
            logger.warning(f"No data in cloud database, inserting full dataset of {document_count} documents from local database")
            latest_cloud_timestamp = datetime.min
        except AutoReconnect as e:
            timeout_time = time.time() - start_time
            raise MongoCloudInterfaceException(f"Network error communicating with cloud database: {e.args[0]}")
        except Exception as e:
            raise MongoCloudInterfaceException("Not connected to cloud database")

        unsynchronized_documents = self.target_local_collection.aggregate(
            [
                {
                    "$match": {
                        "timestamp": {
                            "$gt": latest_cloud_timestamp,
                            "$lte": latest_local_record["timestamp"]
                        }
                    }
                },
                {
                    "$sort": {
                        "timestamp": ASCENDING
                    }
                },
                {
                    "$count": "count"
                }
            ]
        )
        unsynchronized_document_count = [d for d in unsynchronized_documents][0]["count"]

        delta_records = self.target_local_collection.aggregate(
            [
                {
                    "$match": {
                        "timestamp": {
                            "$gt": latest_cloud_timestamp,
                            "$lte": latest_local_record["timestamp"]
                        }
                    }
                },
                {
                    "$sort": {
                        "timestamp": ASCENDING
                    }
                },
                {
                    "$limit": batch_size
                }
            ]
        )

        batch_documents = [r for r in delta_records]
        logger.info(f"Cloud database collection for queue {self.name} is out of sync with local database by {unsynchronized_document_count} documents. Inserting {len(batch_documents)} documents from local database to cloud database")
        self.target_remote_collection.insert_many(batch_documents)

@dataclass
class RADatabaseQueues:
    configuration: MongoConfiguration

    _interface_state: ClassVar[MongoInterfaceState] = None

    def __post_init__(self):
        for collection_name, collection_configuration in self.configuration.collections.database_collections.items():
            setattr(
                self, 
                self.queue_attribute_name(collection_name=collection_name),
                DatabaseQueue(
                    name=collection_name,
                    document_type=collection_configuration.document_type,
                    timeout_secs=self.configuration.queue_get_timeout_secs,
                    parent_container=self
                )
            )

    @property
    def queues_generator(self) -> Generator[Tuple[str, DatabaseQueue], None, None]:
        for attr in dir(self):
            if isinstance(getattr(self, attr), DatabaseQueue):
                yield attr, getattr(self, attr)

    @property
    def interface_state(self) -> MongoInterfaceState:
        return self._interface_state
    
    @interface_state.setter
    def interface_state(self, interface_state: MongoInterfaceState):
        self._interface_state = interface_state

    def check_queue_sizes(self):
        for queue_name, queue in self.queues_generator:
            if queue.qsize > self.configuration.queue_length_warning_threshold:
                logger.warning(f"Database queue {queue_name} length above warning threshold of {self.configuration.queue_length_warning_threshold}")

    @staticmethod
    def queue_attribute_name(collection_name: str) -> str:
        return collection_name + "_queue"

    def get_queue(self, document_type: DocumentType) -> DatabaseQueue:
        for collection_name, collection_configuration in self.configuration.collections.database_collection_generator:
            if collection_configuration.document_type == document_type:
                return getattr(self, self.queue_attribute_name(collection_name=collection_name))

        raise MongoInterfaceException(f"Unknown document type {document_type} to commit to database.")

    def enqueue_record(self, record: MongoTimeseriesRecord | FrontendMessageRecord | IOStateRecord):
        self.get_queue(record.metadata.document_type).put(record)

class DatabaseThread(Thread):
    _interface_state: MongoInterfaceState
    _database_queues_container: RADatabaseQueues

    _run_thread: bool = True

    def __init__(
        self, 
        interface_state: MongoInterfaceState, 
        queues: RADatabaseQueues
    ):
        super(DatabaseThread, self).__init__()
        self._interface_state = interface_state
        self._database_queues_container = queues

    def __hash__(self) -> int:
        return hash((self.name))

    @property
    def run_thread(self):
        return self._run_thread
    
    @run_thread.setter
    def run_thread(self, value: bool):
        self._run_thread = value

    @property
    def local_connection_established(self) -> bool:
        return self._interface_state.local._client is not None

    @property
    def cloud_connection_established(self) -> bool:
        return self._interface_state.cloud._client is not None
    
    @property
    def local_connection_alive(self) -> bool:
        return self._interface_state.local.connection_alive

    @local_connection_alive.setter
    def local_connection_alive(self, value: bool):
        self._interface_state.local.connection_alive = value

    # @property
    # def database_queues(self) -> List[DatabaseQueue]:
    #     return self._database_queues_container.queues

@dataclass
class DatabasePusher(DatabaseThread):
    interface_state: InitVar[MongoInterfaceState]
    database_queues: InitVar[RADatabaseQueues]

    def __post_init__(
        self,
        interface_state: MongoInterfaceState, 
        database_queues: RADatabaseQueues
    ):
        super(DatabasePusher, self).__init__(
            interface_state=interface_state,
            queues=database_queues
        )

        self.run = self._run

    def __hash__(self) -> int:
        return hash((self.name))

    def _run(self):
        while self.run_thread:
            if self.local_connection_established and self.local_connection_alive:
                for queue_name, queue in self._database_queues_container.queues_generator:
                    if queue == None: continue

                    self._cycle_count = 0
                    while not queue.empty:
                        queue_entry = queue.get()

                        try:
                            queue.insert_document_locally(document=queue_entry)
                            self.local_connection_alive = True

                        except (ServerSelectionTimeoutError, MongoInterfaceException, AutoReconnect) as e:
                            logger.error(f"Connection to mongodb instance refused, reenqueueing records in {queue_name}. Received error: {e}")
                            queue.put(queue_entry)
                            self.local_connection_alive = False
                            break

                        except Exception as e:
                            logger.error(f"Error inserting document: {e}. Traceback: {traceback.format_exc()}")
                            a=5
                        
                        self._cycle_count += 1
                        if self._cycle_count >= self._interface_state.local.configuration.cycle_count_before_yield:
                            self._cycle_count = 0
                            time.sleep(0)
                            break
            time.sleep(1)

@dataclass
class DatabasePuller(DatabaseThread):
    command_queue: InitVar["mpQueue[DatabaseCommand]"]
    return_pipe: InitVar[Connection]

    interface_state: InitVar[MongoInterfaceState]
    database_queues: InitVar[RADatabaseQueues]

    _command_queue: ClassVar["mpQueue[DatabaseCommand]"]
    _return_pipe: ClassVar[Connection]
    _run_thread: ClassVar[bool] = True

    def __post_init__(
        self, 
        command_queue: "mpQueue[DatabaseCommand]",
        return_pipe: Connection,
        interface_state: MongoInterfaceState, 
        database_queues: RADatabaseQueues
    ):
        super(DatabasePuller, self).__init__(
            interface_state=interface_state,
            queues=database_queues
        )

        self._command_queue = command_queue
        self._return_pipe = return_pipe

        self.run = self._run
    
    def __hash__(self) -> int:
        return hash((self.name))

    def _run(self):
        while self.run_thread:
            if self._interface_state.local.collections_initialized:
                try:
                    command = self._command_queue.get()
                    if command.command_type == DatabaseCommandType.GET_DOCUMENTS:
                        collection = self._interface_state.local.get_collection(document_type=command.document_type)
                        records = collection.aggregate(
                            [
                                {
                                    "$sort": {
                                        "timestamp": DESCENDING
                                    }
                                },
                                {
                                    "$limit": command.number_of_documents
                                },

                            ]
                        )
                        self._return_pipe.send([r for r in records])
                    elif command.command_type == DatabaseCommandType.GET_AXIS_DOCUMENTS:
                        collection = self._interface_state.local.get_collection(document_type=command.document_type)
                        records = collection.aggregate(
                            [
                                {
                                    "$sort": {
                                        "timestamp": DESCENDING
                                    }
                                },
                                {
                                    "$match": {
                                        "axis_index": command.axis_index
                                    }
                                },
                                {
                                    "$limit": command.number_of_documents
                                },


                            ]
                        )
                        self._return_pipe.send([r for r in records])
                    else:
                        logger.error(f"Unrecognized database command {command}")
                        self._return_pipe.send(None)
                except Empty:
                    pass
            time.sleep(0)


@dataclass
class MongoInterface(Process):
    configuration: MongoConfiguration

    _interface_state: ClassVar[MongoInterfaceState] = None
    _database_queues_container: ClassVar[RADatabaseQueues] = None
    _command_queue: ClassVar["mpQueue[DatabaseCommand]"] = None

    _last_record: ClassVar[MongoTimeseriesRecord] = None

    _run_process: bool = True
    _cycle_count: int = 0
    _last_synchronization_time: float = 0

    _pipe_lock: Lock = None
    _pusher_thread: DatabasePusher = None
    _puller_thread: DatabasePuller = None
    
    def __post_init__(self):
        super(MongoInterface, self).__init__()
        self.name = "ra_mongodb_interface_process"

        if os.environ.get("CONTAINERIZED").lower() == "true":
            self.configuration.local.host = os.environ.get("DATABASE_CONTAINER_NAME")

        self._interface_state = MongoInterfaceState(
            collections_configuration=self.configuration.collections,
            local_configuration=self.configuration.local,
            cloud_configuration=self.configuration.cloud
        )
        
        self._database_queues_container = RADatabaseQueues(
            configuration=self.configuration
        )

        self.pipe_output, self._pipe_input = Pipe()
        self._pipe_lock = Lock()
        self._command_queue = mpQueue()

        if not self.configuration.local.enabled:
            logger.warning(f"Local database is not enabled. No data will be committed.")

        if not self.configuration.cloud.enabled:
            logger.warning(f"Cloud database is not enabled. No data will be committed.")

        self.run = self._run

    def __hash__(self) -> int:
        return hash((self.name))
    
    @property
    def local_connection_established(self) -> bool:
        return self._interface_state.local._client is not None

    @property
    def cloud_connection_established(self) -> bool:
        return self._interface_state.cloud._client is not None
    
    @property
    def local_connection_alive(self) -> bool:
        return self._interface_state.local.connection_alive

    @local_connection_alive.setter
    def local_connection_alive(self, value: bool):
        self._interface_state.local.connection_alive = value
    
    @property
    def cloud_connection_alive(self) -> bool:
        return self._interface_state.cloud.connection_alive
    
    @cloud_connection_alive.setter
    def cloud_connection_alive(self, value: bool):
        self._interface_state.cloud.connection_alive = value

    def enqueue_record(self, data: MongoTimeseriesRecord):
        self._database_queues_container.enqueue_record(data)

    def get_documents_from_collection(self, document_type: DocumentType, number_of_documents: int, timeout: float = 10) -> TimeseriesRecordContainer:
        self._command_queue.put(
            DatabaseCommand(
                command_type=DatabaseCommandType.GET_DOCUMENTS,
                number_of_documents=number_of_documents,
                document_type=document_type
            )
        )

        return self._return_pipe_data(timeout=timeout)
    
    def get_axis_documents_from_collection_by_index(self, axis_index: int, number_of_documents: int, timeout: float = 10) -> TimeseriesRecordContainer:
        self._command_queue.put(
            DatabaseCommand(
                command_type=DatabaseCommandType.GET_AXIS_DOCUMENTS,
                number_of_documents=number_of_documents,
                document_type=DocumentType.AXIS_STATE,
                axis_index=axis_index
            )
        )

        return self._return_pipe_data(timeout=timeout)
    
    def _return_pipe_data(self, timeout: float) -> List:
        try:
            with self._pipe_lock:
                self.pipe_output.poll(timeout=timeout)
                return self.pipe_output.recv()
        except TimeoutError:
            return []
        except Exception as e:
            a=5
            return []

    def get_latest_system_configuration(self, timeout: float = 10) -> HardwareConfiguration | None:
        configuration = self.get_documents_from_collection(document_type=DocumentType.SYSTEM_CONFIGURATION, number_of_documents=1, timeout=timeout)
        if len(configuration) > 0:
            record = HardwareConfigurationRecord.deserialize_from_dict(configuration[0])
            return record.hardware_configuration
        else:
            return None

    def get_io_state(self, number_of_points: int, timeout: float = 10) -> List[IOStateRecord]:
        try:
            message_documents = self.get_documents_from_collection(document_type=DocumentType.IO_STATE, number_of_documents=number_of_points, timeout=timeout)
            return [IOStateRecord.deserialize_from_dict(d) for d in message_documents]
        except TimeoutError:
            logger.error(f"Timed out getting {number_of_points} IO state records from database")
            return []
    
    def get_analog_in_state(self, number_of_points: int, timeout: float = 10) -> List[IOStateRecord]:
        try:
            message_documents = self.get_documents_from_collection(document_type=DocumentType.ANALOG_INPUT_STATE, number_of_documents=number_of_points, timeout=timeout)
            return [IOStateRecord.deserialize_from_dict(d) for d in message_documents]
        except TimeoutError:
            logger.error(f"Timed out getting {number_of_points} ANALOG INPUT state records from database")
            return []

    def get_axis_state(self, axis_index: int, number_of_points: int, timeout: float = 10) -> List[AxisStateRecord]:
        try:
            axis_data_documents = self.get_axis_documents_from_collection_by_index(axis_index=axis_index, number_of_documents=number_of_points, timeout=timeout)
            return [AxisStateRecord.deserialize_from_dict(d) for d in axis_data_documents]
        except TimeoutError:
            logger.error(f"Timed out getting {number_of_points} AXIS {axis_index} state records from database")
            return []
    
    def get_digital_in_state(self, number_of_points: int, timeout: float = 10) -> List[IOStateRecord]:
        try:
            message_documents = self.get_documents_from_collection(document_type=DocumentType.DIGITAL_INPUT_STATE, number_of_documents=number_of_points, timeout=timeout)
            return [IOStateRecord.deserialize_from_dict(d) for d in message_documents]
        except TimeoutError:
            logger.error(f"Timed out getting {number_of_points} DIGITAL INPUT state records from database")
            return []

    def get_messages(self, number_of_messages: int, timeout: float = 10) -> List[FrontendMessageRecord]:
        try:
            message_documents = self.get_documents_from_collection(document_type=DocumentType.FRONTEND_MESSAGE, number_of_documents=number_of_messages)
            return [FrontendMessageRecord.deserialize_from_dict(d) for d in message_documents]
        except TimeoutError:
            logger.error(f"Timed out getting {number_of_messages} messages from database")
            return []

    def get_sensor_data(self, number_of_data_points: int, timeout: float) -> List[SensorDataRecord]:
        try:
            message_documents = self.get_documents_from_collection(document_type=DocumentType.SENSOR_DATA, number_of_documents=number_of_data_points)
            return [SensorDataRecord.deserialize_from_dict(d) for d in message_documents]
        except TimeoutError:
            logger.error(f"Timed out getting {number_of_data_points} sensor data points from database")
            return []

    def get_latest_ui_configuration(self, timeout: float = 10) -> UIConfiguration | None:
        configuration = self.get_documents_from_collection(document_type=DocumentType.UI_CONFIGURATION, number_of_documents=1, timeout=timeout)
        if len(configuration) > 0:
            record = UIConfigurationRecord.deserialize_from_dict(configuration[0])
            return record.ui_configuration
        else:
            return None

    def _run(self):
        self._pusher_thread = DatabasePusher(
            interface_state=self._interface_state,
            database_queues=self._database_queues_container
        )

        self._puller_thread = DatabasePuller(
            interface_state=self._interface_state,
            database_queues=self._database_queues_container,
            command_queue=self._command_queue,
            return_pipe=self._pipe_input
        )

        self._pusher_thread.start()
        self._puller_thread.start()

        logger.success(f"Database interface process launched.")

        while self._run_process: 
            try:
                if self.configuration.local.enabled:
                    self._database_queues_container.check_queue_sizes()

                    if not self.local_connection_established:
                        try:
                            self._interface_state.local._connect()
                            self._database_queues_container.interface_state = self._interface_state
                            
                            self._puller_thread._interface_state = self._interface_state
                            self._pusher_thread._interface_state = self._interface_state
                        except MongoInterfaceException as e:
                            logger.error(f"{e.args[0]}. Yielding before local mongo instance connection reattempt")
                            time.sleep(1)
                    elif not self.local_connection_alive:
                        logger.error(f"Local database connection lost")
                        self.local_connection_alive = self._interface_state.local.ping_database()
                    else:
                        time.sleep(1)
                        
                        # TODO implement later
                        if self.configuration.cloud.enabled and False:
                            try:
                                if not self.cloud_connection_established:
                                    try:
                                        self._interface_state.cloud._connect()
                                        self._data_queue.target_remote_collection = self._interface_state.cloud._data_collection
                                        self._event_queue.target_remote_collection = self._interface_state.cloud._event_collection

                                    except MongoInterfaceException as e:
                                        logger.error(f"{e.args[0]}. Yielding before cloud mongo instance connection reattempt")
                                        time.sleep(0)
                                    except Exception as e:
                                        logger.error(f"Unknown error {e.args[0]} when connecting to cloud database")
                                elif self.local_connection_alive:
                                    for queue in self.database_queues:
                                        if queue == None: continue
                                        if (time.time() - queue._last_synchronization_time) >= self.configuration.database_synchronization_period_sec:
                                            synchronization_time = time.time()
                                            queue.synchronize_databases(
                                                batch_size=self.configuration.synchronization_batch_size
                                            )
                                            self.cloud_connection_alive = True
                                            queue._last_synchronization_time = synchronization_time
                            except MongoLocalInterfaceException as e:
                                logger.error(f"Unable to synchronize cloud and local databases for queue {queue.name}. Local database connection is down. Received error: {e}")
                                self.local_connection_alive = False
                            except (ServerSelectionTimeoutError, MongoCloudInterfaceException, AutoReconnect) as e:
                                logger.error(f"Unable to synchronize cloud and local databases for queue {queue.name}. Received error: {e}")
                                self.cloud_connection_alive = False
                            except Exception as e:
                                logger.error(f"Synchronization error {e}")
                else:
                    # Local database is not enabled
                    for _, queue in self._database_queues_container.queues_generator:
                        while not queue.empty:
                            queue.get_nowait()
            except Exception as e:
                a=5