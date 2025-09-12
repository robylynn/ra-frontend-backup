## Useful curl commands
curl -X POST   http://localhost:8000/database/insert_data/sensor_data   -H "Content-Type: application/json"   -d '[
    {
      "stamp": "2024-08-26T14:00:00Z",
      "device_id": "sensor_001",
      "temperature": 27.5,
      "humidity": 60.2
    },
    {
      "stamp": "2024-08-26T18:01:00Z",
      "device_id": "sensor_002",
      "temperature": 26.1,
      "humidity": 59.8
    }
  ]'

curl -X POST   http://localhost:8000/database/insert_data/logs   -H "Content-Type: application/json"   -d '[
    {
      "time": "2024-08-26T14:00:00Z",
      "device_id": "sensor_001",
      "message_level": "INFO",
      "message": "test log 1"
    },
    {
      "time": "2024-08-26T18:01:00Z",
      "device_id": "sensor_002",
      "message_level": "ERROR",
      "message": "test log 2"
    }
  ]'

curl -X POST "http://localhost:8000/ui/config/abc" \
     -H "Content-Type: application/json" \
     -d '{
           "config_json": {
             "theme": "light",
             "layout": {"sidebarEnabled": true, "headerHeight": 80},
             "components": [
                 {
                     "id": "c6179b00-34a0-4a8f-b98a-7e0e8548a80a",
                     "type": "jogging",
                     "label": "Click Me",
                     "metadata": {"message": "blue", "version": "blue", "pace": 5}
                 },
                 {
                     "id": "e4d2a1b9-3b6d-4c8d-8a9d-1f2e3c4a5b6d",
                     "type": "charts",
                     "label": "Enter your name",
                     "metadata": {"dataset": [5, 5], "chartType": "line", "label": "chart", "column": "axis", "max_length": 200}
                 },
                {
                     "id": "e4d2a1b9-3b6d-4c8d-8a9d-1f2e3c4a5b6e",
                     "type": "camera",
                     "label": "Enter your name",
                     "metadata": {"source": "camera"}
                 }
             ],
             "lastUpdated": "2024-08-27T10:30:00Z"
           }
         }'

curl -X POST "http://localhost:8000/ui/config/abc" \
     -H "Content-Type: application/json" \
     -d '{
           "config_json": {
             "theme": "light",
             "layout": {"sidebarEnabled": true, "headerHeight": 80},
             "components": [
                 {
                     "id": "c6179b00-34a0-4a8f-b98a-7e0e8548a80a",
                     "type": "jogging",
                     "label": "Click Me",
                     "metadata": {"message": "blue", "version": "blue", "pace": 5}
                 },
                 {
                     "id": "e4d2a1b9-3b6d-4c8d-8a9d-1f2e3c4a5b6d",
                     "type": "charts",
                     "label": "Enter your name",
                     "metadata": {
                        "label": "chart", 
                        "traces": [
                            {
                                "table_name": "axis_estimates_0",
                                "column": "position"
                            },
                            {
                                "table_name": "axis_estimates_1",
                                "column": "position"
                            }
                        ], 
                        "max_length": 200
                    }
                 },
                {
                     "id": "e4d2a1b9-3b6d-4c8d-8a9d-1f2e3c4a5b6e",
                     "type": "camera",
                     "label": "Enter your name",
                     "metadata": {"source": "camera"}
                 }
             ],
             "lastUpdated": "2024-08-27T10:30:00Z"
           }
         }'

## Log into database
`psql -h localhost -p 5432 --username=user -d metrics_db`
switch database: `\c mydatabase`