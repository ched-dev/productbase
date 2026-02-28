# ProductBase Development Setup

Instructions to setup dev environment

There is some one-time setup required to get the project running. Follow the steps below.

## Setup `.env` files
A one-time setup of the env files is required.

Run the following commands from the root folder:
```sh
cp ./frontend/.env.example ./frontend/.env
cp ./pocketbase/.env.example ./pocketbase/.env
```

Go into each `.env` file and update the values as needed.

## Startup Docker
You can run this monorepo with a single Docker command:
```sh
docker compose up
```

## Building for production

## Frontend
Docker will run the frontend for you but you may want to run the package install to get support inside your IDE.

Install dependencies with:
```sh
cd ./frontend
nvm use # node v20+
npm install
```

The frontend is available at:
```
http://localhost:8800/
```

## Backend
The entire backend runs on Pocketbase. More details can be found in the [pocketbase/README.md](./pocketbase/README.md) file. The Docker up commands will run pocketbase as well.

The backend is available at:
```
REST API:  http://0.0.0.0:8100/api/
Dashboard: http://0.0.0.0:8100/_/
```
