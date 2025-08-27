# ./tests/test_api_endpoints.py
import pytest
from httpx import AsyncClient
from datetime import datetime, timezone, timedelta
import asyncio
from typing import Dict, Any

# Ensure a dedicated test database is set up by conftest.py's fixtures.


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test the basic health check endpoint."""
    response = await client.get("/status/")  # CHANGED: Prefix with /status/
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "API is running!" in response.json()["message"]
    data = response.json()["data"]
    assert "frontend_configs" in data["schema_loaded_tables"]
    assert "sensor_data" in data["schema_loaded_tables"]
    assert "deployment_environment" in data
    assert data["deployment_environment"] == "testing"


# --- Tests for UI Router Endpoints ---
@pytest.mark.asyncio
async def test_save_and_get_frontend_config(client: AsyncClient):
    """Test saving and retrieving frontend configuration."""
    client_id = "test_client_abc"
    config_payload = {
        "config_json": {
            "plots_count": 2,
            "plot_settings": [
                {"id": 1, "metric": "temperature", "color": "red"},
                {"id": 2, "metric": "humidity", "color": "blue"},
            ],
            "theme": "dark",
            "refresh_rate_ms": 5000,
        }
    }

    # Test saving configuration
    save_response = await client.post(f"/ui/config/{client_id}", json=config_payload)
    assert save_response.status_code == 200
    assert save_response.json()["success"] is True
    assert "saved successfully" in save_response.json()["message"]
    saved_data = save_response.json()["data"]
    assert saved_data["client_id"] == client_id
    assert saved_data["config_data_saved"] == config_payload["config_json"]
    assert "last_updated" in saved_data

    # Test retrieving configuration
    get_response = await client.get(f"/ui/config/{client_id}")
    assert get_response.status_code == 200
    assert get_response.json()["success"] is True
    retrieved_data = get_response.json()["data"]
    assert retrieved_data["client_id"] == client_id
    assert retrieved_data["config_data"] == config_payload["config_json"]
    assert "last_updated" in retrieved_data

    # Test updating configuration
    updated_config_payload = {
        "config_json": {
            "plots_count": 3,
            "plot_settings": [
                {"id": 1, "metric": "temperature", "color": "green"},
                {"id": 3, "metric": "pressure", "color": "purple"},
            ],
            "theme": "light",
        }
    }
    update_response = await client.post(
        f"/ui/config/{client_id}", json=updated_config_payload
    )
    assert update_response.status_code == 200
    assert update_response.json()["success"] is True
    assert "saved successfully" in update_response.json()["message"]

    get_updated_response = await client.get(f"/ui/config/{client_id}")
    assert get_updated_response.status_code == 200
    assert (
        get_updated_response.json()["data"]["config_data"]
        == updated_config_payload["config_json"]
    )


@pytest.mark.asyncio
async def test_get_frontend_config_not_found(client: AsyncClient):
    """Test retrieving non-existent frontend configuration."""
    response = await client.get("/ui/config/non_existent_client")
    assert response.status_code == 404
    assert response.json()["success"] is False
    assert "No configuration found" in response.json()["message"]


@pytest.mark.asyncio
async def test_save_frontend_config_validation_error(client: AsyncClient):
    """Test saving frontend configuration with invalid payload."""
    invalid_payload = {"config_json": "this is not a dict"}  # Should be a dictionary
    response = await client.post("/ui/config/invalid_client", json=invalid_payload)
    assert response.status_code == 422  # Unprocessable Entity for validation errors
    assert response.json()["success"] is False
    assert "Invalid configuration data provided" in response.json()["message"]


# --- Tests for Data Router Endpoints ---
@pytest.mark.asyncio
async def test_create_table(client: AsyncClient):
    """Test creating a dynamic table."""
    table_name = "test_table_create"

    # Force drop the table first if it somehow exists from a previous failed run
    # This is handled by clear_tables fixture typically, but explicit here for clarity
    # Not using client.delete endpoint as we don't have one, relying on auto_setup clean

    response = await client.post(f"/database/create_table/{table_name}")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert (
        f"Table '{table_name}' and hypertable created successfully on local DB."
        in response.json()["message"]
    )

    # Test creating it again (should succeed as IF NOT EXISTS)
    response_again = await client.post(f"/database/create_table/{table_name}")
    assert response_again.status_code == 200
    assert response_again.json()["success"] is True
    assert (
        f"Table '{table_name}' and hypertable created successfully on local DB."
        in response_again.json()["message"]
    )


@pytest.mark.asyncio
async def test_create_table_non_existent_in_schema(client: AsyncClient):
    """Test creating a table not defined in schema.yml."""
    response = await client.post("/database/create_table/non_existent_table_xyz")
    assert response.status_code == 404
    assert response.json()["success"] is False
    assert "not defined in schema.yml" in response.json()["message"]


@pytest.mark.asyncio
async def test_insert_data_and_get_data(client: AsyncClient):
    """Test inserting data and then retrieving it."""
    table_name = "sensor_data"

    # Ensure table exists first
    await client.post(f"/database/create_table/{table_name}")

    timestamp_str_1 = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    timestamp_str_2 = (datetime.now(timezone.utc) + timedelta(minutes=1)).isoformat(
        timespec="milliseconds"
    )

    data_to_insert = [
        {
            "time": timestamp_str_1,
            "device_id": "test-device-01",
            "temperature": 20.5,
            "humidity": 50.1,
        },
        {
            "time": timestamp_str_2,
            "device_id": "test-device-02",
            "temperature": 22.0,
            "humidity": 55.5,
        },
    ]

    # Insert data
    insert_response = await client.post(
        f"/database/insert_data/{table_name}", json=data_to_insert
    )
    assert insert_response.status_code == 201
    assert insert_response.json()["success"] is True
    assert "Data inserted successfully" in insert_response.json()["message"]
    assert len(insert_response.json()["data"]["local_results"]) == 2

    # Retrieve data
    get_response = await client.get(
        f"/database/get_data/{table_name}?limit=1&order_by_column=time"
    )
    assert get_response.status_code == 200
    assert get_response.json()["success"] is True
    retrieved_data = get_response.json()["data"]
    assert len(retrieved_data) == 1
    # Check if the latest record is returned by default or with explicit ordering
    assert (
        retrieved_data[0]["device_id"] == "test-device-02"
    )  # Latest by default due to order_by_column="time" DESC
    assert retrieved_data[0]["temperature"] == 22.0

    # Test with no limit (should return all)
    get_all_response = await client.get(f"/database/get_data/{table_name}")
    assert get_all_response.status_code == 200
    assert len(get_all_response.json()["data"]) == 2


@pytest.mark.asyncio
async def test_insert_data_validation_error(client: AsyncClient):
    """Test inserting data with validation errors."""
    table_name = "sensor_data"
    await client.post(f"/database/create_table/{table_name}")  # Ensure table exists

    invalid_data = [
        {
            "time": "not-a-datetime",  # Invalid type
            "device_id": "test-device-03",
            "temperature": "not-a-float",  # Invalid type
            "humidity": 60.0,
        }
    ]
    response = await client.post(
        f"/database/insert_data/{table_name}", json=invalid_data
    )
    assert response.status_code == 422
    assert response.json()["success"] is False
    assert "Validation failed" in response.json()["message"]
    assert "failed_validations" in response.json()["data"]
    assert len(response.json()["data"]["failed_validations"]) == 1


@pytest.mark.asyncio
async def test_insert_data_unknown_table(client: AsyncClient):
    """Test inserting data into an unknown table."""
    response = await client.post(
        "/database/insert_data/non_existent_table_for_insert",
        json=[{"data": "some_data"}],
    )
    assert response.status_code == 404
    assert response.json()["success"] is False
    assert "not defined in schema.yml" in response.json()["message"]


@pytest.mark.asyncio
async def test_get_data_empty_table(client: AsyncClient):
    """Test retrieving data from an empty table."""
    table_name = "project_metrics"
    await client.post(f"/database/create_table/{table_name}")  # Ensure table exists

    response = await client.get(f"/database/get_data/{table_name}")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert len(response.json()["data"]) == 0


@pytest.mark.asyncio
async def test_get_data_unknown_table(client: AsyncClient):
    """Test retrieving data from an unknown table."""
    response = await client.get("/database/get_data/non_existent_table_for_get")
    assert response.status_code == 404
    assert response.json()["success"] is False
    assert (
        "not defined in schema or models" in response.json()["message"]
    )  # Error from _fetch_historical_data


@pytest.mark.asyncio
async def test_websocket_data_stream_historical(client: AsyncClient):
    """Test WebSocket connection and historical data delivery."""
    table_name = "user_activity"
    await client.post(f"/database/create_table/{table_name}")

    # Insert some data for historical retrieval
    timestamp_str_1 = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    timestamp_str_2 = (datetime.now(timezone.utc) + timedelta(seconds=1)).isoformat(
        timespec="milliseconds"
    )
    initial_data = [
        {
            "activity_time": timestamp_str_1,
            "user_id": "user1",
            "action": "login",
            "duration_ms": 100,
        },
        {
            "activity_time": timestamp_str_2,
            "user_id": "user2",
            "action": "logout",
            "duration_ms": 200,
        },
    ]
    await client.post(f"/database/insert_data/{table_name}", json=initial_data)

    # Use client.ws_connect for WebSocket tests
    async with client.websocket_connect(
        f"/database/ws/data/{table_name}?historical_limit=1"
    ) as websocket:
        # Receive historical data
        historical_message = await websocket.receive_json()
        assert historical_message["type"] == "historical"
        assert len(historical_message["data"]) == 1
        assert (
            historical_message["data"][0]["user_id"] == "user2"
        )  # Latest by default due to order_by_column="time" DESC

        # Insert new data, expect it on WebSocket
        new_timestamp_str = (
            datetime.now(timezone.utc) + timedelta(seconds=2)
        ).isoformat(timespec="milliseconds")
        new_data = [
            {
                "activity_time": new_timestamp_str,
                "user_id": "user3",
                "action": "view_page",
                "duration_ms": 300,
            }
        ]
        insert_response = await client.post(
            f"/database/insert_data/{table_name}", json=new_data
        )
        assert insert_response.status_code == 201

        # Receive live update
        live_message = await websocket.receive_json()
        assert live_message["type"] == "live"
        assert live_message["data"]["user_id"] == "user3"
        assert live_message["data"]["action"] == "view_page"


@pytest.mark.asyncio
async def test_synchronize_all_tables_disabled_cloud(client: AsyncClient):
    """Test synchronization when cloud sync is disabled."""
    response = await client.post("/database/synchronize_all_tables")
    assert response.status_code == 200
    assert (
        response.json()["success"] is False
    )  # Because cloud sync is disabled in 'testing' env
    assert "Cloud database synchronization is disabled" in response.json()["message"]


@pytest.mark.asyncio
async def test_db_query_endpoint(client: AsyncClient):
    """Test the database/test-query endpoint."""
    response = await client.get(
        "/status/database/test-query"
    )  # CHANGED: Prefix with /status/
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["message"] == "Database pool functional."
