# pydantic_template.jinja
from __future__ import annotations
from typing import Literal, Union, List, Optional
from pydantic import BaseModel, Field
import uuid

# MODELS FOR CONFIGURATION


class JoggingMetadata(BaseModel):
    message: str = Field(...)
    version: str = Field(...)
    pace: float = Field(...)

class ChartTraceMetadata(BaseModel):
    table_name: str = Field(...)
    column: str = Field(...)
    color: str = Field(...)

class PlotConfiguration(BaseModel):
    id: uuid.UUID = Field(...)
    name: str = Field(...)
    type: Literal['line','bar','scatter'] = ''
    traces: List[ChartTraceMetadata] = Field(...)
    max_length: float = Field(...)


class PlotConfigurations(BaseModel):
    plot_configurations: List[PlotConfiguration] = Field(...)

class ImageMetadata(BaseModel):
    src: str = Field(...)
    altText: str = Field(...)
    caption: str = Field(...)

class CameraMetadata(BaseModel):
    source: str = Field(...)

class JoggingComponent(BaseModel):
    id: uuid.UUID = Field(...)
    label: str = Field(...)
    type: Literal['jogging'] = Field(...)
    metadata: JoggingMetadata = Field(...)

class ChartComponent(BaseModel):
    id: uuid.UUID = Field(...)
    label: str = Field(...)
    type: Literal['charts'] = Field(...)
    metadata: PlotConfiguration = Field(...)

class ImageComponent(BaseModel):
    id: uuid.UUID = Field(...)
    label: str = Field(...)
    type: Literal['image'] = Field(...)
    metadata: ImageMetadata = Field(...)

class CameraComponent(BaseModel):
    id: uuid.UUID = Field(...)
    label: str = Field(...)
    type: Literal['camera'] = Field(...)
    metadata: CameraMetadata = Field(...)

UiComponent = Union[
        JoggingComponent,
        ChartComponent,
        ImageComponent,
        CameraComponent,
    ]
class UiConfiguration(BaseModel):
    theme: Literal['light','dark','system'] = 'system'
    components: List[UiComponent] = Field(...)
    plots: List[PlotConfiguration] = Field(...)
    lastUpdated: str = Field(...)

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
    racks: List[IoRack] = Field(...)
    lastUpdated: str = Field(...)

class FullConfiguration(BaseModel):
    client_id: str = Field(...)
    ui_configuration: UiConfiguration = Field(...)
    io_configuration: IoConfiguration = Field(...)
