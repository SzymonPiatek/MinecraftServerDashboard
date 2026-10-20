#!/usr/bin/env bash
# Runs on the VPS (called by GitHub Actions): updates the compose files, pulls the new images, swaps the containers.
# Usage: deploy.sh [image-tag]   (default: latest)
set -euo pipefail

# Everything lives in a function so editing this file mid-run (git pull below) can't corrupt the running script.
main() {
  cd "$(dirname "$0")/.."

  export IMAGE_TAG="${1:-latest}"

  git fetch --prune origin main
  git merge --ff-only origin/main

  docker compose pull api web
  # Recreates only services whose image or config changed, so the Minecraft server isn't restarted needlessly.
  docker compose up -d --remove-orphans
  docker image prune -f >/dev/null

  echo "Deployed ${IMAGE_TAG}"
}

main "$@"
exit
