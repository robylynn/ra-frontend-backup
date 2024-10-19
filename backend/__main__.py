import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import (
    auth_router,
    state_router,
    ui_router,
    historian_router,
    config_router,
    streams_router
)

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
    initialize()

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
        historian_router,
        prefix="/historian"
    )

    ra_backend_server.include_router(
        config_router,
        prefix="/configuration"
    )

    ra_backend_server.include_router(
        streams_router,
        prefix="/streams"
    )

    uvicorn.run(ra_backend_server, host="0.0.0.0", port=8000, timeout_keep_alive=0, log_level='debug')