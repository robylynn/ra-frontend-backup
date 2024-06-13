import os, sys

from loguru import logger
from dacite import MissingValueError
from typing import Tuple

from config.models import (
    TelemetryConfiguration
)

from config.loader import (
    load_system_configuration
)

from config.exceptions import (
    InvalidConfigurationException
)

def safe_load_network_configuration() -> TelemetryConfiguration:
    try:
        config_file_name = os.environ.get("CONFIG_FILE")
        system_configuration: TelemetryConfiguration = load_system_configuration(
            config_file_name=config_file_name
        )
    except FileNotFoundError:
        logger.error(f"Configuration file \"{config_file_name}\" not found. Exiting application...")
        sys.exit()  
    except TypeError as e:
        logger.error(f"Configuration file format is incorrect: {e.args[0]}. Exiting application...")
        sys.exit()
    except InvalidConfigurationException as e:
        logger.error(f"Configuration file is invalid: {e.args[0]}. Exiting application...")
        sys.exit()
    except MissingValueError as e:
        logger.error(f"Configuration file missing value: {e}")
        sys.exit()
    except Exception as e:
        logger.error(f"System error: {e}")
        sys.exit()
    
    return system_configuration

def safe_load_configuration_files() -> Tuple[TelemetryConfiguration]:
    network_configuration = safe_load_network_configuration()
    # control_loop_configuration = safe_load_control_loop_configuration()

    # Verify user control loop matching configurations
    # for loop_name, loop_configuration in asdict(control_loop_configuration.loop_configurations).items():
    #     if loop_name not in system_configuration.control_loops.keys():
    #         logger.error(f"Control loop configuration {loop_name} has no matching control loop on system_controller")
    #         sys.exit()
    
    # for control_loop_name, control_loop in system_configuration.control_loops.items():
    #     if control_loop_name not in asdict(control_loop_configuration.loop_configurations).keys():
    #         logger.error(f"Missing control loop configuration for {control_loop_name}")
    #         sys.exit()
    
    return network_configuration#, control_loop_configuration