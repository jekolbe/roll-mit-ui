#!/usr/bin/env bash

# This script is used to deploy the roll-mit-ui application to a server.
set -euo pipefail

# Configuration
APP_DIR="/home/roll-mit-ui"
IMAGE_NAME="roll-mit-ui"
CONTAINER_NAME="roll-mit-ui"
PORT_MAPPING="4000:4000"

echo "=== Changing to app directory: ${APP_DIR} ==="
cd "${APP_DIR}"

echo "=== Pulling latest code (1/2) ==="
git pull

echo "=== Stopping existing container (if running) ==="
if docker ps -q -f name="^${CONTAINER_NAME}$" >/dev/null; then
  docker container stop "${CONTAINER_NAME}"
else
  echo "No running container named ${CONTAINER_NAME}."
fi

echo "=== Removing existing container (if exists) ==="
if docker ps -aq -f name="^${CONTAINER_NAME}$" >/dev/null; then
  docker container rm "${CONTAINER_NAME}"
else
  echo "No container named ${CONTAINER_NAME} to remove."
fi

echo "=== Removing existing image (and any containers using it) ==="
IMAGE_ID="$(docker images -q "${IMAGE_NAME}:latest" || true)"

if [[ -n "${IMAGE_ID}" ]]; then
  # Remove all containers (running or exited) that use this image
  CONTAINERS_USING_IMAGE="$(docker ps -a --filter "ancestor=${IMAGE_NAME}:latest" -q || true)"
  if [[ -n "${CONTAINERS_USING_IMAGE}" ]]; then
    echo "Removing containers using image ${IMAGE_NAME}:latest"
    docker rm -f ${CONTAINERS_USING_IMAGE}
  fi

  echo "Removing image ${IMAGE_NAME}:latest"
  docker image rm "${IMAGE_NAME}:latest"
else
  echo "No image ${IMAGE_NAME}:latest to remove."
fi

echo "=== Changing to app directory again (as in routine) ==="
cd "${APP_DIR}"

echo "=== Pulling latest code (2/2) ==="
git pull

echo "=== Building Docker image: ${IMAGE_NAME} ==="
docker build -t "${IMAGE_NAME}" .

echo "=== Running container: ${CONTAINER_NAME} on port ${PORT_MAPPING} ==="
docker run -d -p "${PORT_MAPPING}" --name "${CONTAINER_NAME}" "${IMAGE_NAME}"

echo "=== Done. Current containers ==="
docker ps