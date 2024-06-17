import uvicorn, os, time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from backend import telemetry_configuration as telemetry_configuration

from api.routers import (
    # components_router,
    # system_router,
    # io_router,
    # control_loops_router,
    # streaming_router,
    auth_router,
    state_router,
    ui_router,
    streaming_router
)

# from utils.utils import (
#     safe_load_configuration_files
# )

from system_initializer import initialize

ra_backend_server = FastAPI()

ra_backend_server.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == "__main__":
    # global system_controller
    # global carbonator_frontend
    # global modbus_interface
    # global system_database
    
    # csv_data_logger=set_up_loggers()
    initialize()

    # logger.info(f"Loading system configuration...")
    # loaded_system_configuration, loaded_control_loop_configuration = safe_load_configuration_files()
    # global telemetry_configuration
    # telemetry_configuration = safe_load_configuration_files()

    # carbonator_backend_server.include_router(
    #     components_router,
    #     prefix="/components"
    # )

    # carbonator_backend_server.include_router(
    #     system_router,
    #     prefix="/system"
    # )

    # carbonator_backend_server.include_router(
    #     io_router,
    #     prefix="/io_points"
    # )

    # carbonator_backend_server.include_router(
    #     control_loops_router,
    #     prefix="/control_loops"
    # )

    # carbonator_backend_server.include_router(
    #     streaming_router,
    #     prefix="/data_streams"
    # )
    ra_backend_server.include_router(
        auth_router,
        prefix="/user"
    )

    ra_backend_server.include_router(
        state_router,
        prefix="/state"
    )

    ra_backend_server.include_router(
        ui_router,
        prefix="/ui"
    )

    ra_backend_server.include_router(
        streaming_router,
        prefix="/streams"
    )
    # )

    # system_controller, carbonator_frontend, modbus_interface, system_database = system_initializer.initialize(
    #     loaded_system_configuration=loaded_system_configuration,
    #     loaded_control_loop_configuration=loaded_control_loop_configuration,
    #     csv_data_logger=csv_data_logger
    # )
    
    # # FIXME
    # system_controller.start()
    # time.sleep(1)
    # modbus_interface.start()
    # time.sleep(1)
    # system_database.start()
    # time.sleep(1)
    # carbonator_frontend.start()
    
    # ## TESTS
    # if os.environ.get("SIMULATE_HARDWARE").lower() == "true":
    #     logger.info(f"Starting PLC simulator process")
    #     mqtt_simulator_process = Process(
    #         target=MQTTSimulator,
    #         args=(loaded_system_configuration,)
    #     )
    #     mqtt_simulator_process.start()

    # logger.info("Starting carbonator backend...")
    uvicorn.run(ra_backend_server, host="0.0.0.0", port=8000, timeout_keep_alive=0)