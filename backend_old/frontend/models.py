from dataclasses import dataclass, asdict

from typing import ClassVar, Dict

from enum import Enum, auto

from backend.utils.utils import database_record_dict_factory


class MessageSeverity(Enum):
    INFO = auto()
    WARNING = auto()
    ERROR = auto()


@dataclass
class FrontendMessage:
    message: str
    severity: MessageSeverity

    def serialize(self) -> Dict:
        return asdict(self, dict_factory=database_record_dict_factory)


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
    _websocket_clients: ClassVar[Dict[int, str]] = {}
    _last_client_id: ClassVar[int] = 0

    def add_client(self) -> int:
        self._last_client_id += 1
        self._clients[self._last_client_id] = FrontendClient(
            client_id=self._last_client_id
        )
        return self._last_client_id

    def add_websocket_client(self) -> int:
        client_id = len(self._websocket_clients.keys()) + 1
        self._websocket_clients[client_id] = client_id
        return client_id

    def remove_websocket_client(self, id: int):
        del self._websocket_clients[id]
