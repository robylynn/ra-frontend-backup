## New frontend code setup
1. Create python virtual environment and install requirements from backend/requirements.txt
2. Start required docker containers using `docker compose -f docker-compose.local.yml up`
3. Run the db manager script to set up the required tables: `python utilities/database/db_manager.py --action auto_setup`
4. Using nodejs v20, make sure required dependencies for the nexjs project are installed with `yarn install` from the `dashboard/` directory
5. Start both the FastAPI backend and the nodejs frontend using the corresponding debug configurations in vscode
6. Register a new account and log in. You may need to refresh the page after an initial login if the UI configuration doesn't load
