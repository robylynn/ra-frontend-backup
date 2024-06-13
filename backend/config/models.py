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
class TelemetryConfiguration:
    devices: List[NetworkDevice]