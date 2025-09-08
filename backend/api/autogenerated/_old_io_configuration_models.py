# pydantic_template.jinja
from __future__ import annotations
from typing import Literal, Union, List, Optional
from pydantic import BaseModel, Field
import uuid

# MODELS FOR IO_CONFIGURATION


class IoPointDescription(BaseModel):
    label: str = Field(...)
    type: Literal['DI','DO','AI','AO'] = ''

class IoPoint(BaseModel):
    id: str = Field(...)
    point_type: IoPointDescription = Field(...)
    point_value: Union[
        float,
        bool,
        ]

class IoModuleDescription(BaseModel):
    name: str = Field(...)
    icon: str = Field(...)
    points: List[IoPointDescription] = Field(...)

class IoModule(BaseModel):
    id: str = Field(...)
    name: str = Field(...)
    type: IoModuleDescription = Field(...)
    points: List[IoPoint] = Field(...)

class IoRackConfig(BaseModel):
    name: str = Field(...)
    address: str = Field(...)
    max_modules: int = Field(...)

class IoRack(BaseModel):
    id: str = Field(...)
    modules: List[IoModule] = Field(...)
    rack_config: IoRackConfig = Field(...)


class IoConfiguration(BaseModel):
    io_racks: List[IoRack] = Field(...)
