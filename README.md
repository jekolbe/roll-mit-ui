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
`cd /home/Caddy`
`caddy start --config Caddyfile`

## Routine
`cd /home/roll-mit-ui`
`git pull`
`docker container stop roll-mit-ui`
`docker container rm roll-mit-ui`
`docker image rm roll-mit-ui:latest`
`cd /home/roll-mit-ui`
`git pull`
`docker build -t roll-mit-ui .`
...wait for build
`docker run -p 4000:4000 --name roll-mit-ui roll-mit-ui`

## Bilder pipeline

Event photos are processed with `scripts/bilder-pipeline.mjs`: copy and rename from a source folder, convert to WebP (target under 1 MB), upload to Hetzner Object Storage, and publish a `manifest.json` that the `/bilder` page loads.

**Setup:** Copy `.env.example` to `.env` and set `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (or enter them when prompted). Optional paths and bucket settings are documented in `.env.example`.

**Source layout:** One subfolder per author. Use `"<Org> <Name>"` (e.g. `ADFC Andreas Prinz`, `Stadt Freiburg Michael Spiegelhalter`) or just `"<Name>"` when there is no organization (e.g. `Toni`). Originals are never modified; work happens in the staging directory.

**Typical workflow:**

```bash
npm run bilder:test    # process and upload 5 images (smoke test)
npm run dev            # check http://localhost:3000/bilder
npm run bilder:clean   # remove test uploads (type "yes" to confirm)
npm run bilder:process # full copy, convert, and upload
```

**Pipeline steps:**

1. **Copy & rename** — images become `"<Org> <Name> 01.jpg"` etc. in `Bilder-staging/renamed/`
2. **WebP** — converted copies in `Bilder-staging/webp/` (quality/resize tuned for under 1 MB)
3. **Upload** — files go to `bilder/` in the bucket; `bilder/manifest.json` and `public/bilder-manifest.json` are updated

**Additional CLI flags** (append after `--`, e.g. `npm run bilder:process -- --dry-run`):

| Flag | Description |
|------|-------------|
| `--limit N` | Only process/upload the first N images |
| `--dry-run` | Print actions without writing files or uploading |
| `--skip-rename` | Skip step 1 (use existing renamed copies) |
| `--skip-webp` | Skip step 2 (use existing WebP files) |
| `--skip-upload` | Skip step 3 (rename and/or convert only) |
| `--source <dir>` | Override source directory |
| `--staging <dir>` | Override staging directory |
| `--clean` | Delete uploaded objects under `bilder/` |
| `--clean --all` | Delete entire bucket contents (use with care) |
| `--yes` | Skip confirmation prompt when cleaning |

**S3 prerequisites (one-time):** Bucket objects must allow public `GetObject`. Add a CORS rule so the site can fetch `manifest.json` from the bucket (e.g. allow `GET` from `https://roll-mit.de` and `http://localhost:3000`).

