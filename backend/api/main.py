# ./api/__main__.py
import os
import sys
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from loguru import logger
import asyncpg
from asyncpg.pool import Pool as AsyncpgPool
import yaml
import uvicorn
from pydantic import ValidationError

from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is in path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.join(current_dir, '..')
sys.path.insert(0, backend_root)

# Import necessary modules
from api.models import ApiResponse, DeploymentConfig, SchemaConfig, DatabaseConnectionConfig
from api.schema_models import LOADED_RAW_SCHEMA, SCHEMA_FILE_PATH, load_raw_schema
from api.data_router import data_router
from api.ui_router import ui_router
from api.auth_router import auth_router
from api.status_router import status_router # Re-import status_router

# --- Loguru Configuration (Centralized) ---
logger.remove()
logger.add(
    sys.stderr,
    level="DEBUG",
    format="{time} | {level} | {module}:{function}:{line} - {message}",
    colorize=True
)

# --- Configuration Loading ---
DATABASE_CONFIGS_PATH = os.path.join(os.getcwd(), 'config', 'database_configs.yml')

def load_database_configs() -> DeploymentConfig:
    """Loads database connection configurations from database_configs.yml."""
    try:
        with open(DATABASE_CONFIGS_PATH, 'r') as f:
            raw_configs = yaml.safe_load(f)
        return DeploymentConfig(**raw_configs)
    except FileNotFoundError:
        logger.error(f"Database configuration file not found at {DATABASE_CONFIGS_PATH}.")
        raise
    except yaml.YAMLError as e:
        logger.error(f"Error parsing database configuration YAML: {e}")
        raise
    except ValidationError as e:
        logger.error(f"Validation error in database configuration: {e}")
        raise
    except Exception as e:
        logger.error(f"An unexpected error occurred during database configuration loading: {e}")
        raise

# --- Global Configuration Objects (set during lifespan) ---
app_config: Optional[DeploymentConfig] = None
current_env_config: Optional[DatabaseConnectionConfig] = None

# --- Lifespan Events ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up...")

    # 1. Load Schema Configuration (ensure it's loaded before DB pools or routers)
    logger.info("Loading raw schema configuration...")
    load_raw_schema()
    if LOADED_RAW_SCHEMA is None:
        logger.critical("Failed to load database schema. Exiting application.")
        sys.exit(1)

    # 2. Load Database Configurations
    global app_config, current_env_config
    try:
        app_config = load_database_configs()
        environment = os.getenv("DEPLOYMENT_ENV", "development").lower()
        if environment == "production":
            current_env_config = app_config.production
        elif environment == "testing":
            current_env_config = app_config.testing
        else:
            current_env_config = app_config.development
        logger.info(f"Loaded database configuration for environment: '{environment}'.")
        app.state.enable_cloud_db = current_env_config.enable_cloud_db
    except Exception as e:
        logger.critical(f"Failed to load database configurations: {e}. Exiting application.")
        sys.exit(1)


    # 3. Initialize asyncpg LOCAL database connection pool
    logger.info("Initializing asyncpg LOCAL database connection pool...")
    try:
        app.state.local_db_pool = await asyncpg.create_pool(current_env_config.local_db_url)
        app.state.local_db_url = current_env_config.local_db_url
        logger.info("Asyncpg LOCAL database connection pool initialized successfully.")
    except Exception as e:
        logger.critical(f"Failed to connect to local database at {current_env_config.local_db_url}: {e}. Exiting application.")
        sys.exit(1)

    # 4. Initialize asyncpg CLOUD database connection pools (if enabled)
    app.state.cloud_db_pools: List[AsyncpgPool] = []
    app.state.cloud_db_urls: List[str] = []
    if app.state.enable_cloud_db and current_env_config.cloud_dbs:
        logger.info(f"Initializing asyncpg CLOUD database connection pools...")
        for idx, cloud_db in enumerate(current_env_config.cloud_dbs):
            try:
                pool = await asyncpg.create_pool(cloud_db.url)
                app.state.cloud_db_pools.append(pool)
                app.state.cloud_db_urls.append(cloud_db.url)
                logger.info(f"Cloud DB pool {idx+1} ('{cloud_db.name}') initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to connect to cloud database '{cloud_db.name}' at {cloud_db.url}: {e}. This cloud DB will be skipped.")
        
        if not app.state.cloud_db_pools:
            logger.warning("All configured cloud database connections failed. Cloud synchronization will be effectively disabled.")
            app.state.enable_cloud_db = False
    else:
        logger.info("ENABLE_CLOUD_DB is false for this environment or no cloud pools available. Cloud database synchronization is disabled.")
        app.state.enable_db = False


    # 5. Initialize WebSocket broadcast queues and active clients
    app.state.websocket_broadcast_queues: Dict[str, asyncio.Queue] = {}
    app.state.websocket_active_clients: Dict[str, List[asyncio.Queue]] = {}
    app.state.broadcast_consumer_tasks: List[asyncio.Task] = []

    if LOADED_RAW_SCHEMA and LOADED_RAW_SCHEMA.tables:
        for table_name in LOADED_RAW_SCHEMA.tables.keys():
            app.state.websocket_broadcast_queues[table_name] = asyncio.Queue()
            app.state.websocket_active_clients[table_name] = []
            
            consumer_task = asyncio.create_task(_broadcast_consumer(app, table_name))
            app.state.broadcast_consumer_tasks.append(consumer_task)
            logger.info(f"Background broadcast consumer task for table '{table_name}' started.")

    logger.info("Application startup complete.")
    yield
    logger.info("Application shutting down...")

    # 6. Close database connection pools
    if hasattr(app.state, 'local_db_pool') and app.state.local_db_pool:
        await app.state.local_db_pool.close()
        logger.info("Local DB pool closed.")
    
    if hasattr(app.state, 'cloud_db_pools') and app.state.cloud_db_pools:
        for idx, pool in enumerate(app.state.cloud_db_pools):
            await pool.close()
            logger.info(f"Cloud DB pool {idx+1} closed.")
    
    # 7. Cancel WebSocket broadcast consumer tasks
    for task in app.state.broadcast_consumer_tasks:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    logger.info("All background tasks cancelled.")

# --- Background WebSocket Broadcast Consumer ---
async def _broadcast_consumer(app: FastAPI, table_name: str):
    """
    Consumes messages from the broadcast queue for a specific table
    and sends them to all active WebSocket clients for that table.
    """
    logger.info(f"Starting WebSocket broadcast consumer for table '{table_name}'")
    queue = app.state.websocket_broadcast_queues[table_name]
    
    while True:
        try:
            message = await queue.get()
            
            disconnected_clients = []
            for client_queue in app.state.websocket_active_clients[table_name]:
                try:
                    client_queue.put_nowait(message)
                except asyncio.QueueFull:
                    logger.warning(f"Client queue for table '{table_name}' is full. Client might be slow to receive.")
                except Exception as e:
                    logger.error(f"Error pushing message to client queue for '{table_name}': {e}")
                    disconnected_clients.append(client_queue)
            
            for client_queue in disconnected_clients:
                if client_queue in app.state.websocket_active_clients[table_name]:
                    app.state.websocket_active_clients[table_name].remove(client_queue)
                    logger.info(f"Removed disconnected client from '{table_name}'. Remaining: {len(app.state.websocket_active_clients[table_name])}")
            
            queue.task_done()
        except asyncio.CancelledError:
            logger.info(f"WebSocket broadcast consumer for table '{table_name}' cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in WebSocket broadcast consumer for table '{table_name}': {e}")
            await asyncio.sleep(1)


# --- FastAPI App Instance ---
backend_api = FastAPI(
    title="Time-Series Backend API",
    description="FastAPI application for managing time-series data and UI configurations.",
    version="1.0.0",
    lifespan=lifespan
)

# Custom Exception Handler for HTTPException
@backend_api.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Custom exception handler to ensure HTTPException responses are always
    formatted as JSON with the correct status code.
    """
    logger.error(f"HTTPException caught by custom handler: Status {exc.status_code}, Detail: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
        headers=exc.headers
    )


# Add CORS middleware to handle cross-origin requests
backend_api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://10.1.0.7:3001"],  # Allowing specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"], # Expose all headers for preflight
)


# --- Register Routers ---
backend_api.include_router(data_router)
backend_api.include_router(ui_router)
backend_api.include_router(auth_router)
backend_api.include_router(status_router) # ADDED: Register the status_router


# --- New Root Endpoint for a simple message ---
@backend_api.get("/", summary="Root API Message", response_model=ApiResponse)
async def root_message():
    """
    Provides a simple welcome message for the API root.
    """
    return ApiResponse(success=True, message="Welcome to the Time-Series Backend API!")


# --- Re-introduced Health Check Endpoint ---
@backend_api.get("/status", summary="API Health Check", response_model=ApiResponse)
async def health_check_status():
    """
    Provides a detailed health check for the API, including database connection status
    and loaded schema information.
    """
    db_status = "Connected" if hasattr(backend_api.state, 'local_db_pool') and backend_api.state.local_db_pool else "Disconnected"
    
    cloud_db_status = "Disabled"
    if hasattr(backend_api.state, 'enable_cloud_db') and backend_api.state.enable_cloud_db:
        if hasattr(backend_api.state, 'cloud_db_pools') and backend_api.state.cloud_db_pools:
            cloud_db_status = f"{len(backend_api.state.cloud_db_pools)} pools active"
        else:
            cloud_db_status = "Enabled, but no pools active"

    schema_loaded = LOADED_RAW_SCHEMA is not None and bool(LOADED_RAW_SCHEMA.tables)
    loaded_tables = list(LOADED_RAW_SCHEMA.tables.keys()) if schema_loaded else []

    message = "API is running and healthy."
    return ApiResponse(
        success=True,
        message=message,
        data={
            "local_db_status": db_status,
            "cloud_db_sync": cloud_db_status,
            "schema_loaded_tables": loaded_tables,
            "deployment_environment": os.getenv("DEPLOYMENT_ENV", "development").lower(),
            "running_consumer_tasks": len(backend_api.state.broadcast_consumer_tasks) if hasattr(backend_api.state, 'broadcast_consumer_tasks') else 0
        }
    )

# --- Re-introduced Available Tables Endpoint ---
@backend_api.get("/status/tables", summary="Get Available Table Names", response_model=ApiResponse)
async def get_available_tables():
    """
    Returns a list of all table names currently loaded from the schema.yml.
    """
    if LOADED_RAW_SCHEMA and LOADED_RAW_SCHEMA.tables:
        table_names = list(LOADED_RAW_SCHEMA.tables.keys())
        return ApiResponse(
            success=True,
            message="Successfully retrieved available table names.",
            data=table_names
        )
    else:
        return ApiResponse(
            success=False,
            message="No tables found in the loaded schema.",
            data=[]
        )


if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 5000))
    uvicorn.run(backend_api, host="0.0.0.0", port=port)

