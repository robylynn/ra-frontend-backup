# pydantic_template.jinja
from __future__ import annotations
from typing import Literal, Union, List, Optional
from pydantic import BaseModel, Field
import uuid

# MODELS FOR UI_CONFIGURATION


class JoggingMetadata(BaseModel):
    message: str = Field(...)
    version: str = Field(...)
    pace: float = Field(...)

class ChartTraceMetadata(BaseModel):
    table_name: str = Field(...)
    column: str = Field(...)
    color: str = Field(...)

class PlotConfiguration(BaseModel):
    id: str = Field(...)
    name: str = Field(...)
    type: Literal['line','bar','scatter'] = ''
    traces: List[ChartTraceMetadata] = Field(...)
    max_length: float = Field(...)


PlotConfigurations = List[PlotConfiguration]

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
class UiConfig(BaseModel):
    theme: Literal['light','dark','system'] = 'system'
    class LayoutNested(BaseModel):
        sidebarEnabled: bool= True
        headerHeight:float= 80
    layout: LayoutNested = Field(...)
    components: List[UiComponent] = Field(...)
    plots: PlotConfigurations = Field(...)
    lastUpdated: str = Field(...)

class UiConfigApiResponse(BaseModel):
    client_id: str = Field(...)
    config_data: UiConfig = Field(...)
    last_updated: str = Field(...)
