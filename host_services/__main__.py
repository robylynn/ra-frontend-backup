# from flask import Flask, jsonify
from fastapi import FastAPI
import uvicorn, os, re
import subprocess

from common_models.models import APIResponse, HostServicesError

ra_host_service_server = FastAPI()


def get_current_ssid() -> str | None:
    output = subprocess.check_output(["nmcli", "dev", "wifi", "show"], text=True)
    current_ssid = [
        line.strip()
        for line in output.splitlines()
        if line.strip() and line.startswith("SSID")
    ][0].replace("SSID: ", "")
    return current_ssid


@ra_host_service_server.get("/current_ssid")
def current_ssid():
    try:
        current_ssid = get_current_ssid()
        return APIResponse(error=False, data=current_ssid)

    except subprocess.CalledProcessError as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description="Subprocess error when getting current SSID",
                details=str(e),
                stderr=e.stderr,
            ),
        )
    except Exception as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Failed to get Wi-Fi IP address",
                details=f"{e}",
            ),
        )

    except Exception as e:
        return {"error": f"{e}"}


@ra_host_service_server.get("/scan")
def scan_wifi():
    try:
        if os.environ["CONTAINERIZED"].lower() == "true":
            output = subprocess.check_output(
                ["iwlist", "wlan0", "scanning"], text=True, stderr=subprocess.PIPE
            )
        else:
            output = subprocess.check_output(
                ["sudo", "iwlist", "wlan0", "scanning"],
                text=True,
                stderr=subprocess.PIPE,
            )

        ssid_output = [
            line.strip()
            for line in output.splitlines()
            if line.strip() and line.strip().startswith("ESSID")
        ]
        ssids = [str(ssid.split(":")[1].replace('"', "")) for ssid in ssid_output]

        return APIResponse(error=False, data=ssids)

    except subprocess.CalledProcessError as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description="Subprocess error scanning Wi-Fi networks",
                details=str(e),
                stderr=e.stderr,
            ),
        )
    except Exception as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Failed scanning Wi-Fi networks",
                details=f"{e}",
            ),
        )


def get_interface_ip(interface_name: str) -> str:
    output = subprocess.check_output(
        ["ip", "addr", "show", "dev", interface_name], text=True, stderr=subprocess.PIPE
    )

    ip = re.findall(r"inet \b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", output)[0].replace(
        "inet ", ""
    )

    return ip


@ra_host_service_server.get("/wifi_ip")
def wifi_ip():
    try:
        return APIResponse(error=False, data=get_interface_ip(interface_name="wlan0"))
    except subprocess.CalledProcessError as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description="Subprocess error when getting Wi-Fi IP address",
                details=str(e),
                stderr=e.stderr,
            ),
        )
    except Exception as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Failed to get Wi-Fi IP address",
                details=f"{e}",
            ),
        )


@ra_host_service_server.get("/ethernet_ip")
def ethernet_ip() -> APIResponse:
    try:
        return APIResponse(error=False, data=get_interface_ip(interface_name="eth1"))
    except subprocess.CalledProcessError as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description="Subprocess error when getting ethernet IP address",
                details=str(e),
                stderr=e.stderr,
            ),
        )
    except Exception as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Failed to get ethernet IP address",
                details=f"{e}",
            ),
        )


@ra_host_service_server.post("/connect_wifi")
def connect_wifi(ssid: str, password: str) -> APIResponse:
    try:
        current_ssid = get_current_ssid()

        if current_ssid == ssid:
            return APIResponse(error=False, data={"already_connected": True})

        if os.environ["CONTAINERIZED"].lower() == "true":
            output = subprocess.check_output(
                [
                    "nmcli",
                    "dev",
                    "wifi",
                    "connect",
                    f"{ssid}",
                    "password",
                    f"{password}",
                ],
                text=True,
                stderr=subprocess.PIPE,
            )
        else:
            output = subprocess.check_output(
                [
                    "sudo",
                    "nmcli",
                    "dev",
                    "wifi",
                    "connect",
                    f"{ssid}",
                    "password",
                    f"{password}",
                ],
                text=True,
                stderr=subprocess.PIPE,
            )

        connect_output = [line.strip() for line in output.splitlines() if line.strip()]
        if any(["successfully activated" in s for s in connect_output]):
            return APIResponse(error=False, data={"connect_success": True})
        else:
            return APIResponse(error=False, data={"connect_success": False})

    except subprocess.CalledProcessError as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Subprocess error when connecting to Wi-Fi network {ssid}",
                details=str(e),
                stderr=e.stderr,
            ),
        )
    except Exception as e:
        return APIResponse(
            error=True,
            error_details=HostServicesError(
                description=f"Failed to connect to Wi-Fi network {ssid}",
                details=f"{e}",
            ),
        )


if __name__ == "__main__":
    uvicorn.run(
        ra_host_service_server,
        host="0.0.0.0",
        port=int(os.environ["HOST_SERVICES_PORT"]),
        timeout_keep_alive=0,
        log_level="warning",
    )
