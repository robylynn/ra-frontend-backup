#!/usr/bin/env python3

## Carbonator Control System
### MongoDB Database Interface
### Developed by R2 Labs for Seabound Carbon

import time, os

from typing import (
    ClassVar,
    Tuple,
    List,
    Union,
    Generator
)

# from enum import (
#     Enum,
#     auto
# )

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
    # MongoConfiguration,
    MongoLocalInterfaceException,
    MongoTimeseriesRecord,
    TimeseriesRecordContainer,
    MongoInterfaceException,
    # MongoInstanceConfiguration,
    MongoFrontendMessage,
    DatabaseCommand,
    DatabaseCommandType,
    IOStateRecord,
    FrontendMessageRecord,
    IOStateRecord,
    DocumentType
)

from config.models import (
    MongoConfiguration,
    MongoInstanceConfiguration,
    DatabaseCollectionsConfiguration
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
    
    # _data_collection: ClassVar[Collection] = None
    # _event_collection: ClassVar[Collection] = None
    # _message_collection: ClassVar[Collection] = None
    # _io_state_collection: ClassVar[Collection] = None

    def __post_init__(self):
        self.shm_connection_alive = Value('i', 0)

        for collection_name, collection_configuration in self.collections_configuration.database_collection_generator:
            # collection_name = ''.join(["_", collection.name, "_collection"])
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
                    # self._data_collection, self._event_collection, self._message_collection, self._io_state_collection = self._create_ra_timeseries_collections()
                    self._create_ra_timeseries_collections()
                else:
                    self._drop_database()
                    # self._data_collection, self._event_collection, self._message_collection, self._io_state_collection = self._create_ra_timeseries_collections()
                    self._create_ra_timeseries_collections()
                    self._create_users()
                
                # if self.configuration.use_frontend_message_collection:
                #     self._message_collection = self._database.create_collection(
                #         capped=True,
                #         size=self.configuration.frontend_message_collection_size_MB
                #     )
                
                self.collections_initialized = True

        except ServerSelectionTimeoutError as e:
            self._client = None
            raise MongoInterfaceException(f"Timed out connecting to mongoDB instance {self.configuration.host}, received error: {e}")
        except Exception as e:
            self._client = None
            raise MongoInterfaceException(f"Timed out connecting to mongoDB instance {self.configuration.host}, received error: {e}")
    
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
                collection = self._database.create_collection(
                    stored_collection_name,
                    timeseries={
                        'timeField': 'timestamp',
                        'metaField': 'metadata',
                        'granularity': 'seconds'
                    },
                    capped=collection_configuration.capped,
                    size=collection_configuration.collection_size_bytes
                )
            else:
                collection = getattr(self._database, stored_collection_name)
            
            setattr(self, self.collection_attribute_name(collection_name), collection)

    def get_collection(self, document_type: DocumentType) -> Collection:
        for collection_name, collection_configuration in self.collections_configuration.items():
            if collection_configuration.document_type == document_type:
                return getattr(self, self.collection_attribute_name(collection_name=collection_name))
        # if document_type == DocumentType.SENSOR_DATA:
        #     return getattr(self, self.collection_attribute_name(self.collections_configuration.sensor_data.__name__))
        # elif document_type == 
        
        # if os.environ.get("CONTAINERIZED").lower() == "true":
        #     host_hostname = os.environ.get("HOST_HOSTNAME")
        #     data_timeseries_collection_name = "_".join([self.configuration.data_timeseries_collection, host_hostname, os.uname()[1]])
        #     event_timeseries_collection_name = "_".join([self.configuration.event_timeseries_collection, host_hostname, os.uname()[1]])
        #     message_collection_name = "_".join([self.configuration.frontend_message_collection, host_hostname, os.uname()[1]])
        #     io_state_collection_name = "_".join([self.configuration.io_state_collection, host_hostname, os.uname()[1]])
        # else:
        #     data_timeseries_collection_name = "_".join([self.configuration.data_timeseries_collection, os.uname()[1]])
        #     event_timeseries_collection_name = "_".join([self.configuration.event_timeseries_collection, os.uname()[1]])
        #     message_collection_name = "_".join([self.configuration.frontend_message_collection, os.uname()[1]])
        #     io_state_collection_name = "_".join([self.configuration.io_state_collection, os.uname()[1]])

        # collections = []
        # for collection_name in (data_timeseries_collection_name, event_timeseries_collection_name):
        #     if collection_name not in self._database.list_collection_names():
        #         logger.info(f"Timeseries collection {collection_name} does not exist, creating...")
        #         collection = self._database.create_collection(
        #             collection_name,
        #             timeseries={
        #                 'timeField': 'timestamp',
        #                 'metaField': 'metadata',
        #                 'granularity': 'seconds'
        #             }
        #         )
        #     else:
        #         if self.configuration.drop_collection_on_start:
        #             self._database.drop_collection(collection_name)
        #         collection = getattr(self._database, collection_name)
        #     collections.append(collection)
        
        # if self.configuration.frontend_message_collection is not None:
        #     if message_collection_name not in self._database.list_collection_names():
        #         message_collection = self._database.create_collection(
        #             message_collection_name,
        #             capped=True,
        #             size=self.configuration.frontend_message_collection_size_bytes
        #         )
        #     else:
        #         message_collection = getattr(self._database, message_collection_name)
        # else:
        #     message_collection = None
        # collections.append(message_collection)

        # if self.configuration.io_state_collection is not None:
        #     if io_state_collection_name not in self._database.list_collection_names():
        #         io_state_collection = self._database.create_collection(
        #             io_state_collection_name,
        #             capped=True,
        #             size=self.configuration.io_state_collection_size_bytes
        #         )
        #     else:
        #         io_state_collection = getattr(self._database, io_state_collection_name)
        # else:
        #     io_state_collection = None
        # collections.append(io_state_collection)

        # return collections

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
    # target_local_collection: Collection = None
    # target_remote_collection: Collection = None

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
        # local_insertion_result = self.target_local_collection.insert_one(document.serialize_to_dict())
        local_insertion_result = target_collection.insert_one(document.serialize_to_dict())
        self._commit_serial_number += 1

        if not local_insertion_result.acknowledged:
            logger.error(f"Queue {self.name} failed to insert record for machine {document.metadata.machine_uid} with timestamp {document.timestamp} into local collection")
            raise MongoInterfaceException
    
    def synchronize_databases(self, batch_size: int):
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

# @dataclass
# class DatabaseThread(Thread):
#     interface_state: InitVar[MongoInterfaceState]
#     data_queue: InitVar[DatabaseQueue]
#     event_queue: InitVar[DatabaseQueue]
#     message_queue: InitVar[DatabaseQueue]
#     io_state_queue: InitVar[DatabaseQueue]

#     _interface_state: ClassVar[MongoInterfaceState]
#     _data_queue: ClassVar[DatabaseQueue]
#     _event_queue: ClassVar[DatabaseQueue]
#     _message_queue: ClassVar[DatabaseQueue]
#     _io_state_queue: ClassVar[DatabaseQueue]

#     _run_thread: ClassVar[bool] = True

#     def __post_init__(
#         self, 
#         interface_state: MongoInterfaceState, 
#         data_queue: DatabaseQueue, 
#         event_queue: DatabaseQueue, 
#         message_queue: DatabaseQueue, 
#         io_state_queue: DatabaseQueue
#     ):
#         super(DatabaseThread, self).__init__()
#         self._interface_state = interface_state
#         self._data_queue = data_queue
#         self._event_queue = event_queue
#         self._message_queue = message_queue
#         self._io_state_queue = io_state_queue

@dataclass
class RADatabaseQueues:
    # get_timeout_sec: float

    configuration: MongoConfiguration

    # data_queue: DatabaseQueue = None
    # event_queue: DatabaseQueue = None
    # message_queue: DatabaseQueue = None
    # io_state_queue: DatabaseQueue = None
    # io_configuration_queue: DatabaseQueue = None
    _interface_state: ClassVar[MongoInterfaceState] = None

    def __post_init__(self):
        for collection_name, collection_configuration in self.configuration.collections.database_collections.items():
            setattr(
                self, 
                self.queue_attribute_name(collection_name=collection_name),
                DatabaseQueue(
                    name=collection_name,
                    timeout_secs=self.configuration.queue_get_timeout_secs,
                    parent=self
                )
            )

            # self.data_queue=DatabaseQueue(
            #     name="data_queue",
            #     timeout_secs=self.get_timeout_sec
            # ),
            # self.event_queue=DatabaseQueue(
            #     name="event_queue",
            #     timeout_secs=self.get_timeout_sec
            # ),
            # self.message_queue=DatabaseQueue(
            #     name="message_queue",
            #     timeout_secs=self.get_timeout_sec
            # ),
            # self.io_state_queue=DatabaseQueue(
            #     name="io_state_queue",
            #     timeout_secs=self.get_timeout_sec
            # )
            # self.io_configuration_queue=DatabaseQueue(
            #     name="io_configuration_queue",
            #     timeout_secs=self.get_timeout_sec
            # )

    @property
    def queues(self) -> List[DatabaseQueue]:
        # return [f[1] for f in fields(self) if isinstance(f[1], DatabaseQueue)]
        return [getattr(self, f.name) for f in fields(self) if isinstance(getattr(self, f.name), DatabaseQueue)]

    @property
    def queues_generator(self) -> Generator[Tuple[str, DatabaseQueue], None, None]:
        # return [f[1] for f in fields(self) if isinstance(f[1], DatabaseQueue)]
        # return [getattr(self, f.name) for f in fields(self) if isinstance(getattr(self, f.name), DatabaseQueue)]
        for f in fields(self):
            if isinstance(getattr(self, f.name), DatabaseQueue):
                yield f.name, getattr(self, f.name)

    @property
    def interface_state(self) -> MongoInterfaceState:
        return self._interface_state
    
    @interface_state.setter
    def interface_state(self, interface_state: MongoInterfaceState):
        self._interface_state = interface_state
        # for queue_name, queue in self.queues_generator:
        #     queue.interface_state = interface_state

    def check_queue_sizes(self):
        for queue_name, queue in self.queues_generator:
            if queue.qsize > self.configuration.queue_length_warning_threshold:
                logger.warning(f"Database queue {queue_name} length above warning threshold of {self.configuration.queue_length_warning_threshold}")

    @staticmethod
    def queue_attribute_name(collection_name: str) -> str:
        return collection_name + "_queue"

    def get_queue(self, document_type: DocumentType) -> DatabaseQueue:
        for collection_name, collection_configuration in self.configuration.collections.items():
            if collection_configuration.document_type == document_type:
                return getattr(self, self.queue_attribute_name(collection_name=collection_name))

        # if document_type == DocumentType.SENSOR_DATA:
        #     queue_name = self.configuration.collections.sensor_data.__name__
        # elif document_type == DocumentType.EVENT:
        #     queue_name = self.configuration.collections.events.__name__
        # elif document_type == DocumentType.IO_STATE:
        #     queue_name = self.configuration.collections.io_state.__name__
        # elif document_type == DocumentType.FRONTEND_MESSAGE:
        #     queue_name = self.configuration.collections.frontend_messages.__name__
        # else:
        raise MongoInterfaceException(f"Unknown document type {document_type} to commit to database.")
        
        # return getattr(self, queue_name + "_queue")

    def enqueue_record(self, record: MongoTimeseriesRecord | FrontendMessageRecord | IOStateRecord):
        self.get_queue(record.metadata.document_type).put(record)
        # if record.metadata.document_type == DocumentType.SENSOR_DATA:
        #     queue: DatabaseQueue = getattr(self, self.configuration.collections.sensor_data.__name__ + "_queue")
        #     queue.put(record)

class DatabaseThread(Thread):
    # interface_state: InitVar[MongoInterfaceState]
    # data_queue: InitVar[DatabaseQueue]
    # event_queue: InitVar[DatabaseQueue]
    # message_queue: InitVar[DatabaseQueue]
    # io_state_queue: InitVar[DatabaseQueue]

    # _interface_state: ClassVar[MongoInterfaceState]
    # _data_queue: ClassVar[DatabaseQueue]
    # _event_queue: ClassVar[DatabaseQueue]
    # _message_queue: ClassVar[DatabaseQueue]
    # _io_state_queue: ClassVar[DatabaseQueue]

    # _run_thread: ClassVar[bool] = True

    _interface_state: MongoInterfaceState
    # _data_queue: DatabaseQueue
    # _event_queue: DatabaseQueue
    # _message_queue: DatabaseQueue
    # _io_state_queue: DatabaseQueue
    _database_queues_container: RADatabaseQueues

    _run_thread: bool = True

    def __init__(
        self, 
        interface_state: MongoInterfaceState, 
        queues: RADatabaseQueues
        # data_queue: DatabaseQueue, 
        # event_queue: DatabaseQueue, 
        # message_queue: DatabaseQueue, 
        # io_state_queue: DatabaseQueue
    ):
        super(DatabaseThread, self).__init__()
        self._interface_state = interface_state
        # self._data_queue = data_queue
        # self._event_queue = event_queue
        # self._message_queue = message_queue
        # self._io_state_queue = io_state_queue
        self._database_queues_container = queues

    def __hash__(self) -> int:
        return hash((self.name))

    @property
    def run_thread(self):
        return self._run_thread
    
    @run_thread.setter
    def run_thread(self, value: bool):
        self._run_thread = value
    
    # @property
    # def interface_state(self) -> MongoInterfaceState:
    #     return self._interface_state
    
    # @interface_state.setter
    # def interface_state(self, state: MongoInterfaceState):
    #     self._interface_state = state

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
    # def database_queues(self) -> Tuple[DatabaseQueue, DatabaseQueue, Union[DatabaseQueue, None]]:
    def database_queues(self) -> List[DatabaseQueue]:
        return self._database_queues_container.queues
        # return (self._data_queue, self._event_queue, self._message_queue, self._io_state_queue)

@dataclass
class DatabasePusher(DatabaseThread):
    # interface_state: MongoInterfaceState
    # data_queue: DatabaseQueue
    # event_queue: DatabaseQueue
    # message_queue: DatabaseQueue
    # io_state_queue: DatabaseQueue
    interface_state: InitVar[MongoInterfaceState]
    database_queues: InitVar[RADatabaseQueues]
    # data_queue: InitVar[DatabaseQueue]
    # event_queue: InitVar[DatabaseQueue]
    # message_queue: InitVar[DatabaseQueue]
    # io_state_queue: InitVar[DatabaseQueue]
    # _interface_state: ClassVar[MongoInterfaceState] = None
    
    # _data_queue: ClassVar[DatabaseQueue]
    # _event_queue: ClassVar[DatabaseQueue]
    # _message_queue: ClassVar[DatabaseQueue]
    # _io_state_queue: ClassVar[DatabaseQueue]

    def __post_init__(
        self,
        interface_state: MongoInterfaceState, 
        database_queues: RADatabaseQueues
        # data_queue: DatabaseQueue, 
        # event_queue: DatabaseQueue, 
        # message_queue: DatabaseQueue, 
        # io_state_queue: DatabaseQueue
    ):
        super(DatabasePusher, self).__init__(
            interface_state=interface_state,
            queues=database_queues
            # data_queue=data_queue,
            # event_queue=event_queue,
            # message_queue=message_queue,
            # io_state_queue=io_state_queue
        )
        # self._interface_state = interface_state
        # self._data_queue = data_queue
        # self._event_queue = event_queue
        # self._message_queue = message_queue
        # self._io_state_queue = io_state_queue
        self.run = self._run

    def __hash__(self) -> int:
        return hash((self.name))

    def _run(self):
        while self.run_thread:
            if self.local_connection_established and self.local_connection_alive:
                for queue in self.database_queues:
                    if queue == None: continue

                    self._cycle_count = 0
                    while not queue.empty:
                        queue_entry = queue.get()

                        try:
                            queue.insert_document_locally(document=queue_entry)
                            self.local_connection_alive = True

                        except (ServerSelectionTimeoutError, MongoInterfaceException, AutoReconnect) as e:
                            logger.error(f"Connection to mongodb instance refused, reenqueueing records in {queue.name}. Received error: {e}")
                            queue.put(queue_entry)
                            self.local_connection_alive = False
                            break

                        except Exception as e:
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
    # data_queue: InitVar[DatabaseQueue]
    # event_queue: InitVar[DatabaseQueue]
    # message_queue: InitVar[DatabaseQueue]
    # io_state_queue: InitVar[DatabaseQueue]
    database_queues: InitVar[RADatabaseQueues]



    # _data_collection: Collection
    # _event_collection: Collection
    # _message_collection: Collection
    # _io_state_collection: Collection

    _command_queue: ClassVar["mpQueue[DatabaseCommand]"]
    _return_pipe: ClassVar[Connection]
    _run_thread: ClassVar[bool] = True

    def __post_init__(
        self, 
        command_queue: "mpQueue[DatabaseCommand]",
        return_pipe: Connection,
        interface_state: MongoInterfaceState, 
        database_queues: RADatabaseQueues
        # data_queue: DatabaseQueue, 
        # event_queue: DatabaseQueue, 
        # message_queue: DatabaseQueue, 
        # io_state_queue: DatabaseQueue
    ):
        # super(DatabasePuller, self).__init__()
        super(DatabasePuller, self).__init__(
            interface_state=interface_state,
            queues=database_queues
            # data_queue=data_queue,
            # event_queue=event_queue,
            # message_queue=message_queue,
            # io_state_queue=io_state_queue
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
                    if command.command_type == DatabaseCommandType.GET_DATA_POINTS:
                        records = self._interface_state.local._data_collection.aggregate(
                            [
                                {
                                    "$sort": {
                                        "timestamp": ASCENDING
                                    }
                                },
                                {
                                    "$limit": command.number_of_points
                                }
                            ]
                        )
                        self._return_pipe.send(records)
                    elif command.command_type == DatabaseCommandType.GET_IO_DATA_POINTS:
                        records = self._interface_state.local._io_state_collection.aggregate(
                            [
                                {
                                    "$sort": {
                                        "timestamp": DESCENDING
                                    }
                                },
                                {
                                    "$limit": command.number_of_points
                                }
                            ]
                        )
                        # z = [r for r in records]
                        # zz = z[0]
                        # y = MongoTimeseriesRecord.deserialize_from_dict(zz)
                        # y = TimeseriesIOData(**zz)
                        # self._return_pipe.send([TimeseriesIOData(**r) for r in records])
                        # self._return_pipe.send([IOStateRecord.deserialize_from_dict(r) for r in records])
                        self._return_pipe.send([IOStateRecord.deserialize_from_dict(r) for r in records])
                    elif command.command_type == DatabaseCommandType.GET_MESSAGES:
                        records = self._interface_state.local._message_collection.aggregate(
                            [
                                {
                                "$sort": {
                                    "timestamp": DESCENDING
                                }
                                },
                                {
                                    "$limit": command.number_of_messages
                                }
                            ]
                        )
                        self._return_pipe.send([FrontendMessageRecord.deserialize_from_dict(r) for r in records])
                except Empty:
                    pass
            time.sleep(0)


@dataclass
class MongoInterface(Process):
    configuration: MongoConfiguration

    _interface_state: ClassVar[MongoInterfaceState] = None

    # _data_queue: ClassVar[DatabaseQueue] = None
    # _event_queue: ClassVar[DatabaseQueue] = None
    # _message_queue: ClassVar[DatabaseQueue] = None
    # _io_state_queue: ClassVar[DatabaseQueue] = None
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
        
        # self._data_queue = DatabaseQueue(
        #     name="data_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )

        # self._event_queue = DatabaseQueue(
        #     name="event_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )

        # self._message_queue = DatabaseQueue(
        #     name="message_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )

        # self._io_state_queue = DatabaseQueue(
        #     name="io_state_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )
        # self._data_queue = DatabaseQueue(
        #     name="data_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )

        # self._event_queue = DatabaseQueue(
        #     name="event_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )

        # self._message_queue = DatabaseQueue(
        #     name="message_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )

        # self._io_state_queue = DatabaseQueue(
        #     name="io_state_queue",
        #     timeout_secs=self.configuration.queue_get_timeout_secs
        # )
        self._database_queues_container = RADatabaseQueues(
            configuration=self.configuration
            # interface_state=self._interface_state
            # get_timeout_sec=self.configuration.queue_get_timeout_secs

            # data_queue=DatabaseQueue(
            #     name="data_queue",
            #     timeout_secs=self.configuration.queue_get_timeout_secs
            # ),
            # event_queue=DatabaseQueue(
            #     name="event_queue",
            #     timeout_secs=self.configuration.queue_get_timeout_secs
            # ),
            # message_queue=DatabaseQueue(
            #     name="message_queue",
            #     timeout_secs=self.configuration.queue_get_timeout_secs
            # ),
            # io_state_queue=DatabaseQueue(
            #     name="io_state_queue",
            #     timeout_secs=self.configuration.queue_get_timeout_secs
            # )
        )

        self.pipe_output, self._pipe_input = Pipe()
        self._pipe_lock = Lock()
        self._command_queue = mpQueue()

        # self._pusher_thread = DatabasePusher(
        #     interface_state=self._interface_state,
        #     data_queue=self._data_queue,
        #     event_queue=self._event_queue,
        #     message_queue=self._message_queue,
        #     io_state_queue=self._io_state_queue
        # )

        # self._puller_thread = DatabasePuller(
        #     interface_state=self._interface_state,
        #     data_queue=self._data_queue,
        #     event_queue=self._event_queue,
        #     message_queue=self._message_queue,
        #     io_state_queue=self._io_state_queue,
        #     command_queue=self._command_queue,
        #     return_pipe=self._pipe_input
        # )

        # self._pusher_thread.start()
        # self._puller_thread.start()

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

    # @property
    # def database_queues(self) -> Tuple[DatabaseQueue, DatabaseQueue, Union[DatabaseQueue, None]]:
    #     return (self._data_queue, self._event_queue, self._message_queue, self._io_state_queue)

    def enqueue_record(self, data: MongoTimeseriesRecord):
        self._database_queues_container.enqueue_record(data)
        # self._database_queues_container.data_queue.put(data)

    # def enqueue_event(self, data: MongoTimeseriesRecord):
    #     self._database_queues_container.event_queue.put(data)

    # def enqueue_message(self, data: FrontendMessageRecord):
    #     self._database_queues_container.message_queue.put(data)
    
    # def enqueue_io_state(self, data: IOStateRecord):
    #     self._database_queues_container.io_state_queue.put(data)

    def get_data_points(self, number_of_points: int) -> TimeseriesRecordContainer:
        self._command_queue.put(
            DatabaseCommand(
                command_type=DatabaseCommandType.GET_DATA_POINTS,
                number_of_points=number_of_points
            )
        )

        return self.pipe_output.recv()
    
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
    
    def get_io_data_points(self, number_of_points: int, timeout: float) -> List[IOStateRecord]:
        self._command_queue.put(
            DatabaseCommand(
                command_type=DatabaseCommandType.GET_IO_DATA_POINTS,
                number_of_points=number_of_points
            )
        )

        return self._return_pipe_data(timeout=timeout)

        # try:
        #     with self.pipe_lock:
        #         self.pipe_output.poll(timeout=timeout)
        #         return self.pipe_output.recv()
        # except TimeoutError:
        #     return []
        # except Exception as e:
        #     a=5
        #     return []
    
    def get_messages(self, number_of_messages: int, timeout: float) -> List[MongoTimeseriesRecord]:
        self._command_queue.put(
            DatabaseCommand(
                command_type=DatabaseCommandType.GET_MESSAGES,
                number_of_messages=number_of_messages
            )
        )

        # return self.pipe_output.recv()
        return self._return_pipe_data(timeout=timeout)

    def _run(self):
        self._pusher_thread = DatabasePusher(
            interface_state=self._interface_state,
            database_queues=self._database_queues_container
            # data_queue=self._data_queue,
            # event_queue=self._event_queue,
            # message_queue=self._message_queue,
            # io_state_queue=self._io_state_queue
        )

        self._puller_thread = DatabasePuller(
            interface_state=self._interface_state,
            database_queues=self._database_queues_container,
            # data_queue=self._data_queue,
            # event_queue=self._event_queue,
            # message_queue=self._message_queue,
            # io_state_queue=self._io_state_queue,
            command_queue=self._command_queue,
            return_pipe=self._pipe_input
        )

        self._pusher_thread.start()
        self._puller_thread.start()

        while self._run_process: 

            if self.configuration.local.enabled:
                self._database_queues_container.check_queue_sizes()
                # data_queue_length = self._database_queues_container.data_queue.qsize
                # if data_queue_length >= self.configuration.queue_length_warning_threshold:
                #     logger.warning(f"Mongo connector data queue length is {data_queue_length}")
                
                # event_queue_length = self._database_queues_container.event_queue.qsize
                # if event_queue_length >= self.configuration.queue_length_warning_threshold:
                #     logger.warning(f"Mongo connector event queue length is {event_queue_length}")

                if not self.local_connection_established:
                    try:
                        self._interface_state.local._connect()
                        self._database_queues_container.interface_state = self._interface_state
                        # self._database_queues_container.data_queue.target_local_collection = self._interface_state.local._data_collection
                        # self._database_queues_container.event_queue.target_local_collection = self._interface_state.local._event_collection
                        # self._database_queues_container.message_queue.target_local_collection = self._interface_state.local._message_collection
                        # self._database_queues_container.io_state_queue.target_local_collection = self._interface_state.local._io_state_collection
                        
                        self._puller_thread._interface_state = self._interface_state
                        self._pusher_thread._interface_state = self._interface_state
                    except MongoInterfaceException as e:
                        logger.error(f"{e.args[0]}. Yielding before local mongo instance connection reattempt")
                        time.sleep(0)
                elif not self.local_connection_alive:
                    logger.error(f"Local database connection lost")
                    self.local_connection_alive = self._interface_state.local.ping_database()
                else:
                    time.sleep(1)
                    # for queue in self.database_queues:
                    #     if queue == None: continue

                    #     self._cycle_count = 0
                    #     while not queue.empty:
                    #         queue_entry = queue.get()

                    #         try:
                    #             queue.insert_document_locally(document=queue_entry)
                    #             self.local_connection_alive = True

                    #         except (ServerSelectionTimeoutError, MongoInterfaceException, AutoReconnect) as e:
                    #             logger.error(f"Connection to mongodb instance refused, reenqueueing records in {queue.name}. Received error: {e}")
                    #             queue.put(queue_entry)
                    #             self.local_connection_alive = False
                    #             break

                    #         except Exception as e:
                    #             a=5
                            
                    #         self._cycle_count += 1
                    #         if self._cycle_count >= self._interface_state.local.configuration.cycle_count_before_yield:
                    #             self._cycle_count = 0
                    #             time.sleep(0)
                    #             break
                    
                    if self.configuration.cloud.enabled:
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
                for queue in self._database_queues_container.queues:
                    while not queue.empty:
                        queue.get_nowait()