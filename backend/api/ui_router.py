# ./api/ui_router.py
import asyncio
from datetime import datetime
from typing import Dict, Any
import json  # NEW: Import json for serialization

from fastapi import APIRouter, HTTPException, Body, Request, status
from pydantic import ValidationError
from loguru import logger
import asyncpg
from asyncpg.pool import Pool as AsyncpgPool

from api.models import ApiResponse, FrontendConfigData
from api.schema_models import LOADED_RAW_SCHEMA


# Create an API Router for UI-related operations
ui_router = APIRouter(
    prefix="/ui",
    tags=["UI Configurations"],
    responses={404: {"description": "Not found"}},
)


# --- Frontend Configuration Management Endpoints ---
@ui_router.get(
    "/config/{client_id}",
    summary="Get Frontend Configuration for Client",
    response_model=ApiResponse,
)
async def get_frontend_config(client_id: str, request: Request):
    """
    Retrieves the saved UI configuration for a specific frontend client.
    This is intended to be called by the frontend application upon page reload.
    The configuration is stored in a 'frontend_configs' table.
    """
    logger.info(
        f"Attempting to retrieve frontend configuration for client: '{client_id}'."
    )
    local_db_pool: AsyncpgPool = request.app.state.local_db_pool
    table_name = "frontend_configs"  # Hardcoded table name for UI configurations

    return ApiResponse(
        success=True,
        message=f"Configuration for client '{client_id}' retrieved successfully.",
        data={
            "theme": "light",
            "layout": {"sidebarEnabled": True, "headerHeight": 80},
            "components": [
                {
                    "id": "c6179b00-34a0-4a8f-b98a-7e0e8548a80a",
                    "type": "jogging",
                    "label": "Click Me",
                    "metadata": {"color": "blue"},
                },
                {
                    "id": "e4d2a1b9-3b6d-4c8d-8a9d-1f2e3c4a5b6d",
                    "type": "charts",
                    "label": "Enter your name",
                },
            ],
            "lastUpdated": "2024-08-27T10:30:00Z",
        },
    )

    # Ensure the frontend_configs table is defined in the schema
    # If not, this is a critical backend setup error
    if LOADED_RAW_SCHEMA is None or table_name not in LOADED_RAW_SCHEMA.tables:
        logger.critical(
            f"Frontend config table '{table_name}' not defined in schema.yml. Cannot retrieve config."
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ApiResponse(
                success=False,
                message=f"Internal server error: '{table_name}' table schema not found. Ensure schema.yml is updated.",
            ).model_dump(),
        )

    query = f"SELECT config_data, last_updated FROM {table_name} WHERE client_id = $1;"

    try:
        async with local_db_pool.acquire() as conn:
            record = await conn.fetchrow(query, client_id)

        if record:
            logger.info(
                f"Successfully retrieved frontend configuration for client '{client_id}'."
            )
            return ApiResponse(
                success=True,
                message=f"Configuration for client '{client_id}' retrieved successfully.",
                data={
                    "client_id": client_id,
                    "config_data": record["config_data"],
                    "last_updated": record["last_updated"].isoformat(),
                },
            )
        else:
            logger.info(
                f"No frontend configuration found for client '{client_id}'. Returning 404."
            )
            # Correctly raise HTTPException for 404, let FastAPI handle it
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ApiResponse(
                    success=False,
                    message=f"No configuration found for client '{client_id}'.",
                ).model_dump(),
            )
    except HTTPException:
        # Re-raise HTTPExceptions directly, don't wrap them in a 500
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error retrieving frontend configuration for client '{client_id}': {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ApiResponse(
                success=False, message=f"An unexpected error occurred: {e}"
            ).model_dump(),
        )


@ui_router.post(
    "/config/{client_id}",
    summary="Save Frontend Configuration for Client",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse,
)
async def save_frontend_config(
    client_id: str, request: Request, config_payload: FrontendConfigData = Body(...)
):
    """
    Saves or updates the UI configuration for a specific frontend client.
    This allows users to persist their custom dashboard/plot settings.
    The configuration is stored in a 'frontend_configs' table.
    """
    logger.info(
        f"Attempting to save/update frontend configuration for client: '{client_id}'."
    )
    local_db_pool: AsyncpgPool = request.app.state.local_db_pool
    table_name = "frontend_configs"  # Hardcoded table name for UI configurations

    if LOADED_RAW_SCHEMA is None or table_name not in LOADED_RAW_SCHEMA.tables:
        logger.critical(
            f"Frontend config table '{table_name}' not defined in schema.yml. Cannot save config."
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ApiResponse(
                success=False,
                message=f"Internal server error: '{table_name}' table schema not found. Ensure schema.yml is updated.",
            ).model_dump(),
        )

    # SQL for upsert: INSERT if not exists, UPDATE if exists
    # Requires client_id to be a UNIQUE constraint in the table schema
    upsert_sql = f"""
        INSERT INTO {table_name} (client_id, config_data, last_updated)
        VALUES ($1, $2, $3)
        ON CONFLICT (client_id) DO UPDATE
        SET config_data = EXCLUDED.config_data,
            last_updated = EXCLUDED.last_updated;
    """

    try:
        current_time = datetime.utcnow()
        # NEW: Serialize the config_payload.config_json (which is a dict) to a JSON string
        json_data_to_store = json.dumps(config_payload.config_json)
        await local_db_pool.execute(
            upsert_sql, client_id, json_data_to_store, current_time
        )  # Pass serialized string

        logger.info(
            f"Successfully saved/updated frontend configuration for client '{client_id}'."
        )
        return ApiResponse(
            success=True,
            message=f"Configuration for client '{client_id}' saved successfully.",
            data={
                "client_id": client_id,
                "config_data_saved": config_payload.config_json,
                "last_updated": current_time.isoformat(),
            },
        )
    except ValidationError as e:
        logger.error(
            f"Validation error saving frontend config for client '{client_id}': {e.errors()}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ApiResponse(
                success=False,
                message="Invalid configuration data provided.",
                data={"errors": e.errors()},
            ).model_dump(),
        )
    except Exception as e:
        # NEW: Convert config_payload.config_json to string for logging to avoid f-string error
        logger.error(
            f"Unexpected error saving frontend configuration for client '{client_id}' with payload {str(config_payload.config_json)}: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ApiResponse(
                success=False, message=f"An unexpected error occurred: {e}"
            ).model_dump(),
        )
