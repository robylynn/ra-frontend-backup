# RA Frontend Setup

## NodeJS Setup
First install node version manager,
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Install NodeJS version 20.13.1,
```
nvm install 20.13.1
nvm use 20.13.1
```

Navigate to the dashboard directory and set up the node packages,
```
cd dashboard && yarn install
```

Patch the Next.JS installation to support [websockets](https://github.com/apteryxxyz/next-ws)
```
npx next-ws-cli@latest patch
```

## Database Container Setup

Next, install docker per the official [instructions](https://docs.docker.com/engine/install/debian/#install-using-the-repository). 

The installation script is set up to for user `r2` (see `/scripts/install.sh`). Modify this accordingly for your system.

Set the environment variables, `. ./scripts/set_env_vars.sh` and create the database directory `./scripts/install.sh`. Start the database container and the database UI, `docker compose up`.

` docker compose -f docker-compose.local.yml up`

Install `mongosh` using the [official instructions](https://www.mongodb.com/docs/mongodb-shell/install/).

Next, log into the database and set up the databases and users (see `docs/database_notes.md` for some extra information).
```
mongosh --port 27017
If not authorized:
    `use admin`
    `db.auth("r2", "password")`
use ra_data
db.createUser({user:"r2",pwd:"password",roles:[{role:"dbAdmin",db:"ra_data"}, { role: 'readWrite', db: 'ra_data' }],mechanisms:[ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]})
```

## Backend Python Application Setup
Set up a virtual environment call `venv` per the usual procedure. The `requirements.txt` file is provided in the repo.

`python3 -m venv venv`
`pip3 install -r requirements`
`source venv/bin/activatge`
`pip3 install -r requirements.txt`


The backend (python application) and server side JS code (Next.JS application) are launched separately using the configurations in `launch.json`. They are not yet set up to be run in docker.



## Environment Setup
The `.env.development` and `.env.production` are used to set environment variables when running in development mode (e.g. `yarn dev`) or production mode (e.g. `yarn build && yarn start`), respectively. There are two relevant variables:
- `CONTROLLER_URI`: This is the URL of the python backend. Typically this will be `localhost:8000`.
- `ROS_HOST`: This is the URL of the rosbridge server. If running the ROS code on actual RAC hardware, set this as the IP address of the jetson (or pi). If running ROS code on a development machine, use the IP of the development machine (which could be `localhost`).

### NEXTAUTH_URL
NextAuth (or Auth.js) requires the definition of a redirect URL to be used after authenticaion is passed. This (inconveniently) has to be set manually. Set the `NEXTAUTH_URL` environment variable to the IP address of the network interface on which the NodeJS server is running. If running on RAC hardware, it should be the IP of the jetson. If running on a development machine, it should be `localhost`. This variable is set in the `docker-compose` file or in `launch.json`.

## Testing dashboard in debug mode
Debug mode allows changes to frontend without rebuilding containers. `launch.json` file in `.vscode/` has the python backend and Next.js frontend debugger settings. Note: Change the `NEXTAUTH_URL` if needed. 

* Run the `Next.js: debug server-side frontend app` debugger
* Run the `Python: Backend` debugger
* Run the mongo docker in local `~ra-frontend`: `docker compose -f docker-compose.local.yml up mongo`

## Testing in ros2_ws

### Allow websocket communicaiton to/from frontend
    run `ros2 run rosbridge_server rosbridge_websocket`

### Run take node without hardware
    run `ros2 run r2c_hardware fake_rac_node.py`

### Run realtime manager node (gpio updates)
    run `ros2 run r2c_hardware realtime_system_manager_node`

## R2 Controller Interfaces
The `r2-controller-interfaces` [repo](https://github.com/R2-Labs/r2-controller-interfaces) is included as a submodule in this project. We can use the `ros-typescript-generator` [project](https://github.com/Greenroom-Robotics/ros-typescript-generator/tree/master) to build TypeScript interfaces from the message and service definitions we use for the RAC. The configuration for the generation of TypeScript interfaces is defined in `dashboard/ros-ts-generator-config.json`. The `ros-typescript-generator` apparently only works on node v14, so we can switch to that with node version manager
```
nvm use 14
npx ros-typescript-generator --config ./ros-ts-generator-config.json
```
Be sure to switch back to node v20 (`nvm use 20`) after generating the code. This only has to be done if the message/service definitions in `r2c_interfaces` changes.

## RA Frontend Interfaces (WIP)
We use `quicktype` to generate types for both python and TypeScript from JSON schema that define the types used in the database. Install quicktype, 
```
npm -g quicktype
```
and invoke with 
```
quicktype --src ../ra-frontend-interfaces/models.json --src-lang schema --lang python --python
-version 3.7  --out ../ra-frontend-interfaces/models.py --just-types
```
