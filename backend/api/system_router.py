# RA Backend Routers
# Developed by R2 Labs

import secrets, time, asyncio, random, subprocess, re, httpx, os, time

from fastapi import WebSocket, APIRouter, Body
from datetime import datetime
from typing import List, Dict, Callable, Literal
from loguru import logger
from common_models.models import APIResponse, HostServicesError

system_router = APIRouter(tags=["System"])


###############################################################################
################################### SYSTEM ####################################
###############################################################################

SIMULATED_NETWORK_SSID = "network_a"


def get_host_ip() -> str:
    if os.environ["CONTAINERIZED"].lower() == "true":
        default_route = subprocess.check_output(
            ["ip", "route", "show", "default"]
        ).decode()
        host_ip = re.findall(
            r"default via \b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", default_route
        )[0].replace("default via ", "")
    else:
        ethernet_ip_output = subprocess.check_output(
            ["ip", "address", "show", "dev", "eth0"]
        ).decode()
        host_ip = re.findall(
            r"inet \b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", ethernet_ip_output
        )[0].replace("inet ", "")

    return host_ip


def execute_host_service_api_request(
    endpoint: str, method: Literal["GET", "POST"] = "GET"
) -> APIResponse:
    try:
        host_ip = get_host_ip()
        host_port = int(os.environ["HOST_SERVICES_API_PORT"])
        http_client = httpx.Client(timeout=15)
        if method == "GET":
            response = http_client.get(f"http://{host_ip}:{host_port}/{endpoint}")
        elif method == "POST":
            response = http_client.post(f"http://{host_ip}:{host_port}/{endpoint}")
        else:
            return APIResponse(
                error=True, description=f"Unrecognized HTTP method {method}"
            )

        return APIResponse(**response.json())
    except Exception as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Error calling host service endpoint /{endpoint}",
                details=f"{e}",
            ),
        )


@system_router.get("/ssids")
async def get_ssid() -> APIResponse:
    if os.environ["SIMULATE_WIFI_CONNECTIONS"].lower() == "true":
        ssids = ["network_a", "network_b", "network_c"]
        time.sleep(2)
        return APIResponse(error=False, data=ssids)
    else:
        return execute_host_service_api_request(endpoint="scan")


@system_router.get("/current_ssid")
def current_ssid() -> APIResponse:
    if os.environ["SIMULATE_WIFI_CONNECTIONS"].lower() == "true":
        return APIResponse(error=False, data={"ssid": SIMULATED_NETWORK_SSID})
    else:
        return execute_host_service_api_request(endpoint="current_ssid")


@system_router.get("/wifi_ip")
def wifi_ip() -> APIResponse:
    if os.environ["SIMULATE_WIFI_CONNECTIONS"].lower() == "true":
        # return APIResponse(error=False, data="0.0.0.0")
        return APIResponse(error=False, data="0.0.0.0")
    else:
        return execute_host_service_api_request(endpoint="wifi_ip")


@system_router.get("/ethernet_ip")
def ethernet_ip() -> APIResponse:
    if os.environ["SIMULATE_WIFI_CONNECTIONS"].lower() == "true":
        return APIResponse(error=False, data="0.0.0.0")
    else:
        return execute_host_service_api_request(endpoint="ethernet_ip")


@system_router.post("/connect_wifi")
async def connect_to_wifi_network(ssid: str, password: str) -> APIResponse:
    global SIMULATED_NETWORK_SSID

    if os.environ["SIMULATE_WIFI_CONNECTIONS"].lower() == "true":
        time.sleep(3)
        SIMULATED_NETWORK_SSID = ssid
        return APIResponse(error=False, data={"success": True})
    else:
        try:
            return execute_host_service_api_request(
                endpoint=f"connect_wifi?ssid={ssid}&password={password}", method="POST"
            )

        except Exception as e:
            return APIResponse(error=True, data={"error": f"{e}"})


