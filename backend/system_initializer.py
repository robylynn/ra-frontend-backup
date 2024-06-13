from config.models import (
    SystemConfiguration
)

from utils.utils import (
    safe_load_configuration_files
)

from frontend.models import (
    RAFrontend
)

from database.interface import (
    MongoInterface
)

from ra_hardware_interface.ra_interface import (
    RAInterface
)

system_configuration: SystemConfiguration = None
ra_frontend: RAFrontend = None
ra_database: MongoInterface = None
ra_interface: RAInterface = None

def initialize():
    global system_configuration
    global ra_frontend, ra_database, ra_interface

    system_configuration = safe_load_configuration_files()
    ra_frontend = RAFrontend()
    ra_database = MongoInterface(
        configuration=system_configuration.database
    )
    ra_database.start()

    ra_interface = RAInterface(
        database=ra_database
    )
    ra_interface.start()
    #a=5