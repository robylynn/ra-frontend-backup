from dataclasses import (
    dataclass,
    asdict
)

from typing import (
    List,
    Dict
)

@dataclass
class NetworkDevice:
    name: str
    customer: str
    IP: str

    def dump_json(self) -> Dict:
        return asdict(self)

@dataclass
class MongoInstanceConfiguration:
    enabled: bool
    connection_timeout_ms: int
    server_selection_timeout_ms: int
    socket_timeout_ms: int
    cycle_count_before_yield: int
    host: str
    port: int
    username: str
    password: str
    database_name: str
    data_timeseries_collection: str
    event_timeseries_collection: str
    frontend_message_collection: str = None
    io_state_collection: str = None
    drop_database_on_start: bool = False
    drop_collection_on_start: bool = False
    # use_frontend_message_collection: bool = False
    frontend_message_collection_size_bytes: int = 1000
    io_state_collection_size_bytes: int = 1000

@dataclass
class MongoConfiguration:
    database_synchronization_period_sec: int
    synchronization_batch_size: int
    queue_length_warning_threshold: int
    queue_get_timeout_secs: float

    local: MongoInstanceConfiguration
    cloud: MongoInstanceConfiguration

@dataclass
class SystemConfiguration:
    # devices: List[NetworkDevice]
    database: MongoConfiguration