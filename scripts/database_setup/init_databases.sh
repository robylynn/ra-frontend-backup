#!/bin/bash
set -e
set -u

# Check if the environment variable is set and not empty
if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
  echo "Creating multiple databases from POSTGRES_MULTIPLE_DATABASES"

  # Split the comma-separated list into an array
  for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
    echo "Creating database '$db'..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
      CREATE DATABASE "$db";
      GRANT ALL PRIVILEGES ON DATABASE "$db" TO "$POSTGRES_USER";
EOSQL
  done

  echo "All databases created successfully."
fi