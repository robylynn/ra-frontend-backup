#!/usr/bin/env python3

## Carbonator Control System
### MongoDB Database Interface
### Developed by R2 Labs for Seabound Carbon

import time, os

from typing import (
    ClassVar,
    Tuple,
    List,
    Union
)

from dataclasses import (
    dataclass, 
    InitVar
)

from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.database import Database
from pymongo.collection import Collection
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure, AutoReconnect
from queue import Empty
from multiprocessing import (
    Process,
    Value,
    Queue as mpQueue
)

from datetime import datetime

from database.models import (
    MongoCloudInterfaceException,
    MongoConfiguration,
    MongoLocalInterfaceException,
    MongoTimeseriesRecord,
    MongoInterfaceException,
    MongoInstanceConfiguration,
    MongoFrontendMessage
)

from loguru import logger

@dataclass
class DatabaseInstance:
    configuration: MongoInstanceConfiguration
    
    shm_connection_alive: Value = None
    collections_initialized: bool = False
    
    _client: ClassVar[MongoClient] = None
    _database: ClassVar[Database] = None
    
    _data_collection: ClassVar[Collection] = None
    _event_collection: ClassVar[Collection] = None
    _message_collection: ClassVar[Collection] = None
    _io_state_collection: ClassVar[Collection] = None

    def __post_init__(self):
        self.shm_connection_alive = Value('i', 0)

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
                    self._data_collection, self._event_collection, self._message_collection, self._io_state_collection = self._create_carbonator_timeseries_collections()
                else:
                    self._drop_database()
                    self._data_collection, self._event_collection, self._message_collection, self._io_state_collection = self._create_carbonator_timeseries_collections()
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
    
    def _create_carbonator_timeseries_collections(self) -> List[Collection]:
        if os.environ.get("CONTAINERIZED").lower() == "true":
            host_hostname = os.environ.get("HOST_HOSTNAME")
            data_timeseries_collection_name = "_".join([self.configuration.data_timeseries_collection, host_hostname, os.uname()[1]])
            event_timeseries_collection_name = "_".join([self.configuration.event_timeseries_collection, host_hostname, os.uname()[1]])
            message_collection_name = "_".join([self.configuration.frontend_message_collection, host_hostname, os.uname()[1]])
            io_state_collection_name = "_".join([self.configuration.io_state_collection, host_hostname, os.uname()[1]])
        else:
            data_timeseries_collection_name = "_".join([self.configuration.data_timeseries_collection, os.uname()[1]])
            event_timeseries_collection_name = "_".join([self.configuration.event_timeseries_collection, os.uname()[1]])
            message_collection_name = "_".join([self.configuration.frontend_message_collection, os.uname()[1]])
            io_state_collection_name = "_".join([self.configuration.io_state_collection, os.uname()[1]])

        collections = []
        for collection_name in (data_timeseries_collection_name, event_timeseries_collection_name):
            if collection_name not in self._database.list_collection_names():
                logger.info(f"Timeseries collection {collection_name} does not exist, creating...")
                collection = self._database.create_collection(
                    collection_name,
                    timeseries={
                        'timeField': 'timestamp',
                        'metaField': 'metadata',
                        'granularity': 'seconds'
                    }
                )
            else:
                if self.configuration.drop_collection_on_start:
                    self._database.drop_collection(collection_name)
                collection = getattr(self._database, collection_name)
            collections.append(collection)
        
        if self.configuration.frontend_message_collection is not None:
            if message_collection_name not in self._database.list_collection_names():
                message_collection = self._database.create_collection(
                    message_collection_name,
                    capped=True,
                    size=self.configuration.frontend_message_collection_size_bytes
                )
            else:
                message_collection = getattr(self._database, message_collection_name)
        else:
            message_collection = None
        collections.append(message_collection)

        if self.configuration.io_state_collection is not None:
            if io_state_collection_name not in self._database.list_collection_names():
                io_state_collection = self._database.create_collection(
                    io_state_collection_name,
                    capped=True,
                    size=self.configuration.io_state_collection_size_bytes
                )
            else:
                io_state_collection = getattr(self._database, io_state_collection_name)
        else:
            io_state_collection = None
        collections.append(io_state_collection)

        return collections

@dataclass
class MongoInterfaceState:
    local_configuration: InitVar[MongoInstanceConfiguration]
    cloud_configuration: InitVar[MongoInstanceConfiguration]

    local: ClassVar[DatabaseInstance] = None
    cloud: ClassVar[DatabaseInstance] = None

    def __post_init__(self, local_configuration: MongoInstanceConfiguration, cloud_configuration: MongoInstanceConfiguration):
        self.local = DatabaseInstance(configuration=local_configuration)
        self.cloud = DatabaseInstance(configuration=cloud_configuration)

@dataclass
class DatabaseQueue:
    name: str
    timeout_secs: int
    target_local_collection: Collection = None
    target_remote_collection: Collection = None

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
        document.metadata.commit_serial_number = self._commit_serial_number
        local_insertion_result = self.target_local_collection.insert_one(document.serialize_to_dict())
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

@dataclass
class MongoInterface(Process):
    configuration: MongoConfiguration

    _interface_state: ClassVar[MongoInterfaceState] = None

    _data_queue: ClassVar[DatabaseQueue] = None
    _event_queue: ClassVar[DatabaseQueue] = None
    _message_queue: ClassVar[DatabaseQueue] = None
    _io_state_queue: ClassVar[DatabaseQueue] = None

    _last_record: ClassVar[MongoTimeseriesRecord] = None

    _run_process: bool = True
    _cycle_count: int = 0
    _last_synchronization_time: float = 0
    
    def __post_init__(self):
        super(MongoInterface, self).__init__()
        self.name = "carbonator_mongodb_interface_process"

        if os.environ.get("CONTAINERIZED").lower() == "true":
            self.configuration.local.host = os.environ.get("DATABASE_CONTAINER_NAME")

        self._interface_state = MongoInterfaceState(
            local_configuration=self.configuration.local,
            cloud_configuration=self.configuration.cloud
        )
        
        self._data_queue = DatabaseQueue(
            name="data_queue",
            timeout_secs=self.configuration.queue_get_timeout_secs
        )

        self._event_queue = DatabaseQueue(
            name="event_queue",
            timeout_secs=self.configuration.queue_get_timeout_secs
        )

        self._message_queue = DatabaseQueue(
            name="message_queue",
            timeout_secs=self.configuration.queue_get_timeout_secs
        )

        self._io_state_queue = DatabaseQueue(
            name="io_state_queue",
            timeout_secs=self.configuration.queue_get_timeout_secs
        )

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

    @property
    def database_queues(self) -> Tuple[DatabaseQueue, DatabaseQueue, Union[DatabaseQueue, None]]:
        return (self._data_queue, self._event_queue, self._message_queue, self._io_state_queue)

    def enqueue_record(self, data: MongoTimeseriesRecord):
        self._data_queue.put(data)

    def enqueue_event(self, data: MongoTimeseriesRecord):
        self._event_queue.put(data)

    def enqueue_message(self, data: MongoTimeseriesRecord):
        self._message_queue.put(data)
    
    def enqueue_io_state(self, data: MongoTimeseriesRecord):
        self._io_state_queue.put(data)

    def _run(self):
        while self._run_process: 

            if self.configuration.local.enabled:
                data_queue_length = self._data_queue.qsize
                if data_queue_length >= self.configuration.queue_length_warning_threshold:
                    logger.warning(f"Mongo connector data queue length is {data_queue_length}")
                
                event_queue_length = self._event_queue.qsize
                if event_queue_length >= self.configuration.queue_length_warning_threshold:
                    logger.warning(f"Mongo connector event queue length is {event_queue_length}")

                if not self.local_connection_established:
                    try:
                        self._interface_state.local._connect()
                        self._data_queue.target_local_collection = self._interface_state.local._data_collection
                        self._event_queue.target_local_collection = self._interface_state.local._event_collection
                        self._message_queue.target_local_collection = self._interface_state.local._message_collection
                        self._io_state_queue.target_local_collection = self._interface_state.local._io_state_collection
                        
                    except MongoInterfaceException as e:
                        logger.error(f"{e.args[0]}. Yielding before local mongo instance connection reattempt")
                        time.sleep(0)
                elif not self.local_connection_alive:
                    logger.error(f"Local database connection lost")
                    self.local_connection_alive = self._interface_state.local.ping_database()
                else:
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
                for queue in self.database_queues:
                    while not queue.empty:
                        queue.get_nowait()