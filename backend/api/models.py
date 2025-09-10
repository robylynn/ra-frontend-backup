# ./api/models.py
from __future__ import annotations
from pydantic import BaseModel, Field, HttpUrl, ValidationError
from typing import Optional, Any, Dict, List
from pathlib import Path
from datetime import datetime
import uuid


# --- Models for Schema.yml Structure ---
class ColumnDef(BaseModel):
    """Represents a column definition from schema.yml."""

    type: str = Field(..., alias="name")


class TableDef(BaseModel):
    """Represents a single table's definition in the schema file."""

    columns: Dict[str, Any]
    hypertable_column: Optional[str] = Field(
        None, description="The column used as the TimescaleDB hypertable dimension."
    )
    number_of_tables: Optional[int] = None


class SchemaConfig(BaseModel):
    """Represents the entire schema.yml structure."""

    tables: Dict[str, TableDef]


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
    local_db_url: str = Field(
        ..., description="The connection URL for the local database."
    )
    cloud_dbs: List[CloudDbInstance] = Field(
        default_factory=list,
        description="List of cloud database instances for this environment.",
    )


class DeploymentConfig(BaseModel):
    """Represents the top-level structure of the database_configs.yml file."""

    development: DatabaseConnectionConfig
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
        ..., description="The actual JSON object containing frontend UI configurations."#, default_factory=dict
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