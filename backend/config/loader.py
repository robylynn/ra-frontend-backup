import dacite, os, yaml

from loguru import logger
from typing import Dict

# from carbonator_backend.configuration.models import (
#     SystemConfiguration,
# )

# from carbonator_backend.configuration.exceptions import InvalidConfigurationException

# from user_code.models import (
#     ControllerLoopConfigurationTypes,
#     UserControlLoopConfigurations
# )

from config.models import (
    SystemConfiguration
)

def load_system_configuration(config_file_name: str = "system_configuration.yaml") -> SystemConfiguration:
    config_file_directory = os.environ.get("CONFIG_FILE_DIR")
    logger.info(f"Opening config file from {config_file_directory}")
    
    config_file_path = os.path.join(config_file_directory, config_file_name)

    with open(config_file_path, 'r') as configfile:
        datafile=yaml.safe_load(configfile)
        app_configuration = dacite.from_dict(data_class=SystemConfiguration, data=datafile)

        post_check_system_configuration(app_configuration)
        
    return app_configuration

def post_check_system_configuration(configuration: SystemConfiguration):
    pass