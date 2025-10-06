# ./api/models.py
from __future__ import annotations
from pydantic import BaseModel, Field, HttpUrl, ValidationError, ConfigDict
from fastapi import Request
from typing import Optional, Any, Dict, List, Set, cast
from pathlib import Path
from datetime import datetime
from asyncpg.pool import Pool as AsyncpgPool
from loguru import logger
from enum import Enum
import uuid, asyncio

from backend.api.subscription_manager import SubscriptionManager

class DatabaseExceptionReason(Enum):
    TABLE_NOT_FOUND = 1
    VALIDATION_FAILED = 2
    EMPTY_COMMIT = 3
    COMMMIT_FAILED = 4
    COMMIT_PARTIAL_SUCCESS = 5

class DatabaseException(Exception):
    def __init__(self, message: str, exception_reason: DatabaseExceptionReason, details: Dict = None):
        super().__init__(message)
        self.exception_reason = exception_reason
        self.details = details
        
        # self.message = f"{message}. Details: {details}" if details else message

class ApiState(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    local_db_pool: AsyncpgPool = None
    websocket_broadcast_queues: Dict[str, asyncio.Queue] = {}
    websocket_active_clients: Dict[str, List[asyncio.Queue]] = {}
    broadcast_consumer_tasks: List[asyncio.Task] = []
    cloud_db_pools: List[AsyncpgPool] = []
    cloud_db_urls: List[str] = []
    enable_db: bool = False
    enable_cloud_db: bool = False
    local_db_url: str = ""
    subscription_manager: SubscriptionManager = None


def typedAppState(request: Request) -> ApiState:
    return cast(ApiState, request.app.state)


class DatabaseInsertResult(BaseModel):
    record_index: int = Field(...)
    success: bool = Field(...)
    error: str = Field(default='')
    data: Dict = Field(default={})

# --- Models for Database Configuration YAML ---
class CloudDbInstance(BaseModel):
    """Represents a single cloud database instance."""

    name: str = Field(
        ..., description="A unique identifier/name for this cloud database instance."
    )
    url: str  # Store as string to handle full connection URL, Pydantic will validate format if needed


class DatabaseConnectionConfig(BaseModel):
    """Represents connection details for a specific deployment environment (local + cloud list)."""

    enable_cloud_db: bool = Field(
        True,
        description="Whether cloud synchronization is enabled for this environment.",
    )
    # local_db_url: str = Field(
    #     ..., description="The connection URL for the local database."
    # )
    local_db_host: str = Field(..., description="The host for the local database.")
    local_db: str = Field(
        ..., description="The database to use for the local connection."
    )
    local_db_port: int = Field(
        ..., description="The port for the local database connection."
    )
    cloud_dbs: List[CloudDbInstance] = Field(
        default_factory=list,
        description="List of cloud database instances for this environment.",
    )


class DeploymentConfig(BaseModel):
    """Represents the top-level structure of the database_configs.yml file."""

    development: DatabaseConnectionConfig
    docker_development: DatabaseConnectionConfig
    production: DatabaseConnectionConfig
    testing: DatabaseConnectionConfig
    # Add other environments here if needed (e.g., staging: DatabaseConnectionConfig)


# --- Frontend Configuration Table Model (Moved from data_router.py) ---
class ConfigData(BaseModel):
    """
    Pydantic model for frontend configuration data.
    Define your actual configuration schema here for strong validation.
    Example:
        plots_count: int
        plot_settings: List[Dict[str, Any]]
        theme: str
    """

    config_json: Dict[str, Any] = Field(
        ...,
        description="The actual JSON object containing frontend UI configurations.",  # , default_factory=dict
    )
    # io_config_json: Dict[str, Any] = Field(
    #     ..., description="The actual JSON object containing IO configurations.", default_factory=dict
    # )


# ---------------------------------------------------------------------------------------------------------------------
# Authentication and User Models
# ---------------------------------------------------------------------------------------------------------------------


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    user_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[uuid.UUID] = None


# ---------------------------------------------------------------------------------------------------------------------
# Camera Models
# ---------------------------------------------------------------------------------------------------------------------


class CameraStreamRequestData(BaseModel):
    camera_id: int = Field(default=0)
    uvc_camera: bool = Field(default=False)
    # Add optional fields for future use
    frame_width: Optional[int] = Field(default=None)
    frame_height: Optional[int] = Field(default=None)
    fps: Optional[int] = Field(default=None)


class CameraStreamResponseData(BaseModel):
    success: bool
    message: str
    # Add optional fields for future response data
    stream_url: Optional[str] = Field(default=None)
    camera_status: Optional[str] = Field(default=None)
