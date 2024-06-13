from dataclasses import dataclass
from typing import (
    ClassVar,
    Dict
)

from enum import (
    Enum,
    auto
)

class MessageSeverity(Enum):
    INFO = auto()
    WARNING = auto()
    ERROR = auto()

@dataclass
class FrontendClient:
    client_id: int = 0

    _configured: ClassVar[bool] = False

    @property
    def configured(self) -> bool:
        return self._configured

    @configured.setter
    def configured(self, value: bool):
        self._configured = value

@dataclass
class RAFrontend:
    _clients: ClassVar[Dict[int, FrontendClient]] = {}
    _last_client_id: ClassVar[int] = 0

    def add_client(self) -> int:
        self._last_client_id += 1
        self._clients[self._last_client_id] = FrontendClient(
            client_id=self._last_client_id
        )
        return self._last_client_id