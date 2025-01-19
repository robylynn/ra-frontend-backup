from dataclasses import dataclass
from typing import Optional, List, Dict, Any, Union


@dataclass
class ROSTimestamp:
    nanosec: Optional[int] = None
    seconds: Optional[int] = None


@dataclass
class ROSIOState:
    stamp: Optional[ROSTimestamp] = None
    time_nsec: Optional[int] = None
    time_sec: Optional[int] = None
    values: Optional[Union[List[bool], Dict[str, Any]]] = None
