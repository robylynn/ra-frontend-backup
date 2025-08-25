# ./tests/conftest.py
import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient
import os
import subprocess
import asyncpg
from urllib.parse import urlparse
from typing import AsyncGenerator
import sys
from asyncpg.pool import Pool as AsyncpgPool

# Adjust sys.path to ensure 'backend' is recognized as a package root
# This allows importing 'api.main', 'utilities.db_manager', etc.
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.join(current_dir, '..')
sys.path.insert(0, backend_root)

# Import the FastAPI app instance and the lifespan context manager function from api.main
from api.main import backend_api as app_instance_from_main, load_app_db_config, lifespan
from api.models import DeploymentConfig, DatabaseConnectionConfig # Import models for type hinting
from fastapi import FastAPI # Import FastAPI for type hinting the app instance


# Custom session-scoped event_loop fixtures or policies have been removed,
# as pytest-asyncio will now be configured via pytest.ini to handle this globally.


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database_and_app():
    """
    Fixture to set up and tear down a dedicated test database and configure
    the FastAPI app for the testing environment.
    This runs once per test session.
    """
    # 0. Ensure Pydantic models are generated from the main schema.yml
    # This is crucial for the FastAPI app to import correctly.
    original_env_var = os.environ.get('DEPLOYMENT_ENV') # Store original env var
    os.environ['DEPLOYMENT_ENV'] = 'testing' # Temporarily set to testing for db_manager

    try:
        print("\nINFO: Running utilities.generate_models to ensure Pydantic models are up-to-date...")
        subprocess.run(
            ['python', '-m', 'utilities.generate_models'],
            check=True,
            cwd=backend_root,
            capture_output=True,
            text=True
        )
        print("INFO: Pydantic models generated successfully.")
    except subprocess.CalledProcessError as e:
        pytest.fail(f"Failed to generate Pydantic models: {e.stderr}")
    finally:
        # Restore original DEPLOYMENT_ENV after generate_models if it was changed
        if original_env_var is not None:
            os.environ['DEPLOYMENT_ENV'] = original_env_var
        else:
            if 'DEPLOYMENT_ENV' in os.environ:
                del os.environ['DEPLOYMENT_ENV']


    # 1. Load the testing database configuration
    try:
        test_db_config = load_app_db_config(env="testing")
    except Exception as e:
        pytest.fail(f"Failed to load testing database configuration: {e}")

    test_db_url = test_db_config.local_db_url
    parsed_url = urlparse(test_db_url)
    db_name = parsed_url.path.lstrip('/')
    default_db_url = parsed_url._replace(path='/postgres').geturl()

    # Ensure the test database exists and is clean
    conn = None
    try:
        # CHANGED: Removed explicit loop= argument; asyncpg will now implicitly use the loop
        # set up by pytest-asyncio in 'auto' mode.
        conn = await asyncpg.connect(default_db_url)
        # Terminate existing connections to allow dropping
        await conn.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}' AND pid <> pg_backend_pid();
        """)
        await conn.execute(f'DROP DATABASE IF EXISTS "{db_name}";')
        await conn.execute(f'CREATE DATABASE "{db_name}";')
        print(f"\nINFO: Test database '{db_name}' ensured (dropped and recreated).")
    except Exception as e:
        print(f"ERROR: Failed to set up test database: {e}")
        pytest.fail(f"Failed to set up test database: {e}")
    finally:
        if conn:
            await conn.close()

    # 2. Run db_manager to setup tables in the test database
    # Temporarily set DEPLOYMENT_ENV to 'testing' for db_manager.py
    # Re-store original_env_var as generate_models might have already set it
    original_env_var = os.environ.get('DEPLOYMENT_ENV')
    os.environ['DEPLOYMENT_ENV'] = 'testing'

    try:
        print(f"INFO: Running db_manager.py --action auto_setup --drop-local-existing for test DB '{db_name}'...")
        # Execute db_manager.py as a module from the backend root
        result = subprocess.run(
            ['python', '-m', 'utilities.db_manager', '--action', 'auto_setup', '--drop-local-existing'],
            check=True,
            cwd=backend_root, # Run from the backend root
            capture_output=True, # Capture stdout and stderr
            text=True # Decode stdout and stderr as text
        )
        print("INFO: db_manager.py auto_setup completed for testing environment.")
        # If successful, print stdout/stderr for debugging if needed
        if result.stdout:
            print(f"db_manager.py stdout:\n{result.stdout}")
        if result.stderr:
            print(f"db_manager.py stderr:\n{result.stderr}")
    except subprocess.CalledProcessError as e:
        stdout_output = e.stdout if e.stdout else "No stdout captured."
        stderr_output = e.stderr if e.stderr else "No stderr captured."
        
        full_error_message = (
            f"db_manager.py failed with exit code {e.returncode}.\n"
            f"--- db_manager.py stdout ---\n{stdout_output}\n"
            f"--- db_manager.py stderr ---\n{stderr_output}\n"
        )
        print(f"ERROR: {full_error_message}")
        pytest.fail(f"db_manager.py failed during test setup: {full_error_message}")
    finally:
        if original_env_var is not None:
            os.environ['DEPLOYMENT_ENV'] = original_env_var
        else:
            # If DEPLOYMENT_ENV was not set, ensure it's removed after tests
            if 'DEPLOYMENT_ENV' in os.environ:
                del os.environ['DEPLOYMENT_ENV']

    # 3. Yield control to tests, allowing them to run against the configured app
    # The FastAPI app's lifespan will be managed by AsyncClient below,
    # ensuring the DB pool points to the test DB because DEPLOYMENT_ENV will be set to 'testing'
    yield

    # 4. Teardown: Drop the test database after the test session
    conn = None
    try:
        # CHANGED: Removed explicit loop= argument.
        conn = await asyncpg.connect(default_db_url)
        await conn.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}' AND pid <> pg_backend_pid();
        """)
        await conn.execute(f'DROP DATABASE IF EXISTS "{db_name}";')
        await conn.execute(f'CREATE DATABASE "{db_name}";') # Recreate for next session if needed, or simply drop
        print(f"INFO: Test database '{db_name}' dropped and recreated (for clean session start).")
    except Exception as e:
        print(f"ERROR: Error tearing down test database: {e}")
    finally:
        if conn:
            await conn.close()

# Fixture for the FastAPI application instance
@pytest_asyncio.fixture(scope="session")
async def backend_api(setup_test_database_and_app) -> AsyncGenerator[FastAPI, None]:
    """
    Provides the FastAPI application instance with its lifespan managed
    for the entire test session.
    """
    # Temporarily set DEPLOYMENT_ENV to 'testing' for the app's lifespan to pick up 'testing' config
    original_env_var = os.environ.get('DEPLOYMENT_ENV')
    os.environ['DEPLOYMENT_ENV'] = 'testing'

    # Explicitly enter the lifespan context manager using the lifespan function itself.
    # This ensures that all startup events, including database pool initialization,
    # are run when this fixture is set up.
    async with lifespan(app_instance_from_main):
        yield app_instance_from_main

    # Restore original DEPLOYMENT_ENV
    if original_env_var is not None:
        os.environ['DEPLOYMENT_ENV'] = original_env_var
    else:
        if 'DEPLOYMENT_ENV' in os.environ:
            del os.environ['DEPLOYMENT_ENV']

@pytest_asyncio.fixture(scope="function") # Use function scope for client to ensure clean state per test
async def client(backend_api: FastAPI) -> AsyncGenerator[AsyncClient, None]: # Depends on backend_api fixture
    """
    Fixture for an httpx AsyncClient to interact with the FastAPI application.
    It properly manages the FastAPI lifespan for each test function if needed,
    but here relies on the session-scoped setup to configure the app for testing.
    """
    # IMPORTANT: Temporarily set DEPLOYMENT_ENV for the app instance to pick up 'testing' config
    original_env_var = os.environ.get('DEPLOYMENT_ENV')
    os.environ['DEPLOYMENT_ENV'] = 'testing'

    # The backend_api.lifespan context manager is automatically entered and exited
    # by AsyncClient when used with 'async with'. This ensures DB pools are set up
    # for the 'testing' environment as specified by os.environ['DEPLOYMENT_ENV'].
    async with AsyncClient(app=backend_api, base_url="http://test") as ac: # Use backend_api fixture
        yield ac
    
    # Restore original DEPLOYMENT_ENV
    if original_env_var is not None:
        os.environ['DEPLOYMENT_ENV'] = original_env_var
    else:
        if 'DEPLOYMENT_ENV' in os.environ:
            del os.environ['DEPLOYMENT_ENV']

@pytest_asyncio.fixture(scope="function")
async def db_pool(backend_api: FastAPI) -> AsyncpgPool: # Injects backend_api fixture
    """
    Provides a direct asyncpg pool connection to the test database for tests
    that need to assert database state directly.
    """
    # Access the local_db_pool directly from the backend_api state
    return backend_api.state.local_db_pool

# Fixture to clear all tables between each test function
@pytest_asyncio.fixture(scope="function", autouse=True)
async def clear_tables(db_pool: AsyncpgPool):
    """
    Clears all tables in the test database after each test function.
    This ensures each test starts with a clean slate.
    """
    # Retrieve the schema config to know which tables to clear
    from api.schema_models import LOADED_RAW_SCHEMA
    if LOADED_RAW_SCHEMA is None or not LOADED_RAW_SCHEMA.tables:
        pytest.fail("Schema not loaded, cannot clear tables.")
    
    tables_to_clear = list(LOADED_RAW_SCHEMA.tables.keys()) + ["frontend_configs"] # Ensure frontend_configs is included

    async with db_pool.acquire() as conn:
        for table_name in tables_to_clear:
            try:
                # CHANGED: Removed explicit loop= argument.
                await conn.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;")
                # RESTART IDENTITY resets auto-incrementing IDs
                # CASCADE drops objects that depend on the table (e.g., foreign keys if any)
            except asyncpg.exceptions.UndefinedTableError:
                # This can happen if a table was just created by a test and then dropped,
                # or if some tables aren't expected to exist yet. Log and continue.
                print(f"WARNING: Table '{table_name}' not found during TRUNCATE. Skipping.")
            except Exception as e:
                pytest.fail(f"Failed to truncate table {table_name}: {e}")
    yield
    # No further teardown needed here, as setup_test_database_and_app handles session teardown.
