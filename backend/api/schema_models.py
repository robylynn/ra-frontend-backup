import os, sys
import yaml
from typing import Dict, Any, Optional
from loguru import logger  # Keep logger import, but remove configuration here
from pydantic import BaseModel, Field

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


# LOADED_RAW_SCHEMA will now be an instance of SchemaConfig
LOADED_RAW_SCHEMA: Optional[SchemaConfig] = None

# Schema file path is now relative to the container's root working directory /app/config/schema.yml
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, "..", "..")
sys.path.insert(0, project_root)
SCHEMA_FILE_PATH = os.path.join(project_root, "r2_backend_models", "schemas", "database_schema.yml")


def load_raw_schema():
    """
    Loads the raw database schema from schema.yml into a SchemaConfig Pydantic model.
    This provides type hinting and validation for the schema structure itself.
    It also dynamically augments the schema with entries for dynamically generated tables.
    """
    global LOADED_RAW_SCHEMA

    try:
        with open(SCHEMA_FILE_PATH, "r") as f:
            raw_yaml_data = yaml.safe_load(f)

        # Validate and load the raw YAML data into the SchemaConfig Pydantic model
        LOADED_RAW_SCHEMA = SchemaConfig(**raw_yaml_data)
        logger.info("Raw schema loaded successfully into SchemaConfig model.")

        # Dynamically add the generated table names to the schema
        dynamic_tables_to_add = {}
        for table_name, table_def in LOADED_RAW_SCHEMA.tables.items():
            if table_def.number_of_tables is not None:
                for i in range(table_def.number_of_tables):
                    dynamic_table_name = f"{table_name}_{i}"
                    dynamic_tables_to_add[dynamic_table_name] = table_def

        # Merge the dynamic table entries into the main schema
        LOADED_RAW_SCHEMA.tables.update(dynamic_tables_to_add)
        logger.info(
            f"Augmented schema with {len(dynamic_tables_to_add)} dynamic tables."
        )

    except FileNotFoundError:
        logger.error(
            f"Schema file not found at {SCHEMA_FILE_PATH}. Please ensure it exists in the 'config' directory."
        )
        LOADED_RAW_SCHEMA = SchemaConfig(
            tables={}
        )  # Provide an empty default to prevent errors
    except yaml.YAMLError as e:
        logger.error(f"Error parsing YAML schema file: {e}")
        LOADED_RAW_SCHEMA = SchemaConfig(tables={})
    except Exception as e:
        logger.error(f"An unexpected error occurred during raw schema loading: {e}")
        LOADED_RAW_SCHEMA = SchemaConfig(tables={})


load_raw_schema()  # Load raw schema on import
