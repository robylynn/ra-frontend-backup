import os, sys, numpy as np

from loguru import logger
from dacite import MissingValueError
from typing import Tuple
from enum import Enum
from typing import (
    Dict,
    List,
    Callable
)

from config.models import (
    SystemConfiguration
)

from config.loader import (
    load_system_configuration
)

from config.exceptions import (
    InvalidConfigurationException
)

def safe_load_system_configuration() -> SystemConfiguration:
    try:
        config_file_name = os.environ.get("CONFIG_FILE")
        system_configuration: SystemConfiguration = load_system_configuration(
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

def safe_load_configuration_files() -> Tuple[SystemConfiguration]:
    network_configuration = safe_load_system_configuration()
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

def websocket_message_dict_factory(dataclass):
    d = {}
    for field in dataclass:
        if isinstance(field[1], Enum):
            d[field[0]] = field[1].name
        elif isinstance(field[1], List) and all([isinstance(entry, Enum) for entry in field[1]]):
            d[field[0]] = [entry.name for entry in field[1]]
        elif isinstance(field[1], np.float128):
            d[field[0]] = float(field[1])
        else:
            d[field[0]] = field[1]
    return d

def timeseries_record_dict_factory(dataclass):
    d = {}
    for field in dataclass:
        if isinstance(field[1], Enum):
            d[field[0]] = field[1].name
        elif field[0] == '_id':
            pass
        elif field[1] == None:
            pass
        else:
            d[field[0]] = field[1]
    return d

def io_record_dict_factory(dataclass):
    d = {}
    for field in dataclass:
        if isinstance(field[1], Enum):
            d[field[0]] = field[1].name
        elif field[0] == '_id':
            pass
        elif field[1] == None:
            pass
        elif isinstance(field[1], Callable):
            pass
        else:
            d[field[0]] = field[1]
    return d