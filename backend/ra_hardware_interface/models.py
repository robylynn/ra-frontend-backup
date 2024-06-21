from dataclasses import dataclass
from loguru import logger
from enum import (
    Enum,
    auto
)
from typing import (
    List,
    ClassVar
)

class IOPointType(Enum):
    DIGITAL_INPUT = auto()
    DIGITAL_OUTPUT = auto()
    ANALOG_VOLTAGE_INPUT = auto()
    ANALOG_VOLTAGE_OUTPUT = auto()
    ANALOG_CURRENT_INPUT = auto()
    ANALOG_CURRENT_OUTPUT = auto()

@dataclass
class IOPoint:
    point_type: IOPointType
    name: str
    index: int
    
    configured: ClassVar[bool]
    state: ClassVar[bool | int | float]

@dataclass
class IOPort:
    name: str
    number_of_points: int
    
    points: ClassVar[List[IOPoint]] = None

    def __post_init__(self):
        self.points = self.number_of_points*None

    def add_point(self, point_type: IOPointType, name: str, index: int):
        point = IOPoint(
            point_type=point_type,
            name=name,
            index=index
        )
        point.configured = True

        try:
            self.points[index] = point
        except IndexError:
            logger.error(f"Cannot add point to {self.name} at index {index}, index out of range.")
    
    def remove_point(self, index: int):
        try:
            self.points[index] = None
        except IndexError:
            logger.error(f"Cannot remove point from {self.name} at index {index}, index out of range.")

@dataclass
class IOSystem:
    digital_inputs: IOPort
    digital_outputs: IOPort
    programmable_digital_io: IOPort
    analog_inputs: IOPort
    analog_outputs: IOPort
