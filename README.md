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