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

Install `mongosh` using the [official instructions](https://www.mongodb.com/docs/mongodb-shell/install/).

Next, log into the database and set up the databases and users (see `docs/database_notes.md` for some extra information).
```
mongosh --port 27017
use ra_data
db.createUser({user:"r2",pwd:"password",roles:[{role:"dbAdmin",db:"ra_data"}, { role: 'readWrite', db: 'ra_data' }],mechanisms:[ 'SCRAM-SHA-1', 'SCRAM-SHA-256' ]})
```

## Backend Python Application Setup
Set up a virtual environment per the usual procedure. The `requirements.txt` file is provided in the repo.

The backend (python application) and server side JS code (Next.JS application) are launched separately using the configurations in `launch.json`. They are not yet set up to be run in docker.

## Environment Setup
The `.env.development` and `.env.production` are used to set environment variables when running in development mode (e.g. `yarn dev`) or production mode (e.g. `yarn build && yarn start`), respectively. There are two relevant variables:
- `CONTROLLER_URI`: This is the URL of the python backend. Typically this will be `localhost:8000`.
- `ROS_HOST`: This is the URL of the rosbridge server. If running the ROS code on actual RAC hardware, set this as the IP address of the jetson (or pi). If running ROS code on a development machine, use the IP of the development machine (which could be `localhost`).

### NEXTAUTH_URL
NextAuth (or Auth.js) requires the definition of a redirect URL to be used after authenticaion is passed. This (inconveniently) has to be set manually. Set the `NEXTAUTH_URL` environment variable to the IP address of the network interface on which the NodeJS server is running. If running on RAC hardware, it should be the IP of the jetson. If running on a development machine, it should be `localhost`. This variable is set in the `docker-compose` file or in `launch.json`.