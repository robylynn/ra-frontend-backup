# ./api/schema_models.py
import os
import yaml
from typing import Dict, Any, Optional
from loguru import logger  # Keep logger import, but remove configuration here

# Import the new Pydantic model for schema configuration
from api.models import SchemaConfig

# --- Loguru Configuration for this module ---
# NEW: Removed local loguru configuration to centralize it in api/main.py
# logger.remove() # Remove default handler (important to avoid duplicating handlers from main)
# logger.add(
#     os.sys.stderr,
#     level="INFO",
#     format="{time} | {level} | {module}:{function}:{line} - {message}",
#     colorize=True
# )

# LOADED_RAW_SCHEMA will now be an instance of SchemaConfig
LOADED_RAW_SCHEMA: Optional[SchemaConfig] = None

# Schema file path is now relative to the container's root working directory /app/config/schema.yml
SCHEMA_FILE_PATH = os.path.join(os.getcwd(), "config", "schema.yml")


def load_raw_schema():
    """
    Loads the raw database schema from schema.yml into a SchemaConfig Pydantic model.
    This provides type hinting and validation for the schema structure itself.
    """
    global LOADED_RAW_SCHEMA

    try:
        with open(SCHEMA_FILE_PATH, "r") as f:
            raw_yaml_data = yaml.safe_load(f)

        # Validate and load the raw YAML data into the SchemaConfig Pydantic model
        LOADED_RAW_SCHEMA = SchemaConfig(**raw_yaml_data)
        logger.info("Raw schema loaded successfully into SchemaConfig model.")

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
