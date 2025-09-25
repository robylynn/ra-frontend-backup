from asyncpg.pool import Pool as AsyncpgPool
from typing import Any, List

from backend.api.schema_models import TableDef
from loguru import logger


async def check_existing_tables(pool: AsyncpgPool) -> List[str]:
    get_tables_query = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            """

    async with pool.acquire() as conn:
        # await conn.execute(get_tables_query)
        data_records = await conn.fetch(get_tables_query)
        table_names = [r.get("table_name") for r in data_records]
        return table_names


async def setup_table(
    pool: AsyncpgPool,
    table_name: str,
    table_def: TableDef,
    db_identifier: str = "Local",
):
    """Creates a table and hypertable in a given database pool."""
    tables = await check_existing_tables(pool=pool)
    if table_name in tables:
        logger.info(
            f"Table {table_name} already exists in {db_identifier} database, skipping creation."
        )
        return

    logger.info(f"INFO: Setting up table '{table_name}' in {db_identifier} DB...")

    columns = table_def.columns
    hypertable_column = table_def.hypertable_column

    column_defs = ", ".join(
        [f"{col_name} {col_type}" for col_name, col_type in columns.items()]
    )

    # NEW: Add PRIMARY KEY constraint for client_id for frontend_configs table
    if table_name == "frontend_configs" and "client_id" in columns:
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({column_defs}, PRIMARY KEY (client_id));"
    else:
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({column_defs});"

    # Only create hypertable if hypertable_column is defined and not null
    create_hypertable_sql = None
    if hypertable_column:
        create_hypertable_sql = f"SELECT create_hypertable('{table_name}', '{hypertable_column}', if_not_exists => TRUE);"

    try:
        async with pool.acquire() as conn:
            await conn.execute(create_table_sql)
            if create_hypertable_sql:
                await conn.execute(create_hypertable_sql)
        logger.info(
            f"Table '{table_name}' created/ensured hypertable in {db_identifier} DB."
        )
        # return True
    except Exception as e:
        logger.error(
            f"Failed to set up table '{table_name}' in {db_identifier} DB: {e}"
        )
        # return False
        raise
