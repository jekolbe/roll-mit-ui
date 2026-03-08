# Roll MIT

This contains everything you need to run the app locally.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Run on VPS

`docker build -t roll-mit-ui .`
`docker run -p 4000:4000 roll-mit-ui`

On startup
`sudo service apache2 stop`
`caddy start --config Caddyfile`

Routine
`docker container stop <name>`
`docker container rm <name>`
`docker image rm roll-mit-ui:latest`
`cd /home/roll-mit-ui`
`git pull`
`docker build -t roll-mit-ui .`
...wait for build
`docker run -p 4000:4000 --name roll-mit-ui roll-mit-ui`
