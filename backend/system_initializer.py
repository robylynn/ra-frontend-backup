from config.models import (
    TelemetryConfiguration
)

from utils.utils import (
    safe_load_configuration_files
)

telemetry_configuration: TelemetryConfiguration = None

def initialize():
    global telemetry_configuration

    telemetry_configuration = safe_load_configuration_files()
    #a=5