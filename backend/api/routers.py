import secrets, os, subprocess, shlex, re, warnings

from fastapi import WebSocket, APIRouter, Body
from typing import List

import system_initializer as initializer

from auth.models import UserLoginSchema
from auth.jwt_handler import signJWT
from auth.jwt_bearer import JWTBearer
from api.models import (
    AuthenticationResponse,
    APIResponse
)
from config.models import (
    NetworkDevice
)

auth_router=APIRouter(
    tags=[
        "User"
    ]
)

state_router=APIRouter(
    tags=[
        "Status"
    ]
)

def check_user(data: UserLoginSchema):
    return True
    # for user in system_initializer.system_controller.configuration.frontend.users:
    #     if user.username == data.username and user.password == data.password:
    #         return True
    # return False

@auth_router.post("/login", tags=["user"])
def user_login(user: UserLoginSchema = Body(default=None)) -> AuthenticationResponse:
    if check_user(user):
        # logger.info(f"Logging in user {user.username}")
        return AuthenticationResponse(
            authenticated=True,
            signed_token=signJWT(
                user.username,
                authenticated=True,
                # secret=system_initializer.carbonator_frontend._jwt_secret_key,
                secret=secrets.token_urlsafe(32),
                algorithm="HS256"
            )
        )
        
    else:
        # logger.info(f"Login failed for user {user.username}")
        return AuthenticationResponse(
            authenticated=False,
            signed_token=""
        )

@state_router.get("/heartbeat")
async def heartbeat() -> APIResponse:
    return APIResponse(error=False, data=f"ACK")

@state_router.get("/clients")
def get_wireguard_clients() -> APIResponse:
    output = subprocess.Popen(shlex.split("docker exec -it wireguard wg"), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = [l for l in output.stdout]
    err = [l for l in output.stderr]

    IPs = []
    # with warnings.catch_warnings(action="ignore"):
    ip_matcher = re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")

    for line in out:
        # if re.findall("[0-9][0-9]\.[0-9]\.[0-9]\[0-9]", line.decode()):
        ip =  re.findall(ip_matcher, line.decode())
        if len(ip) > 0:
            IPs.append(ip[0])
    
    connected_devices: List[NetworkDevice] = []
    for ip in IPs:
        for device in initializer.telemetry_configuration.devices:
            if device.IP == ip:
                connected_devices.append(device.dump_json())

    if output.returncode == 1:
        # Error
        return APIResponse(error=True, data=err)
    else:
        return APIResponse(error=False, data=connected_devices)