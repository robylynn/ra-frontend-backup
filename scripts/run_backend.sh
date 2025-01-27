#/bin/bash

export PROJECT_ROOT="$PWD/"
source $PROJECT_ROOT/backend/venv/bin/activate
export PYTHONPATH=$PROJECT_ROOT/backend
# export PYTHONPATH=$PROJECT_ROOT
echo $PYTHONPATH
export CONFIG_FILE_DIR=$PROJECT_ROOT/config
export CONFIG_FILE=system_configuration.yaml
export CONTAINERIZED=false

cd $PROJECT_ROOT
python3 -m backend