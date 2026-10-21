#!/usr/bin/env bash
# Local dev against the production Minecraft server: forwards its RCON (25575) and the Docker proxy (2375) to localhost.
# Nothing is published on the VPS; the tunnel targets the containers' addresses on the Docker network, seen from the host.
# Usage: pnpm tunnel   (target: TUNNEL_SSH in .env, default ubuntu@spiatek.pl; compose dir: TUNNEL_REMOTE_DIR, default ~/dashboard)
set -euo pipefail

cd "$(dirname "$0")/.."

env_value() { [[ -f .env ]] && grep -E "^$1=" .env | tail -n1 | cut -d= -f2- | tr -d '"' || true; }

target="${TUNNEL_SSH:-$(env_value TUNNEL_SSH)}"
target="${target:-ubuntu@spiatek.pl}"
remote_dir="${TUNNEL_REMOTE_DIR:-$(env_value TUNNEL_REMOTE_DIR)}"
remote_dir="${remote_dir:-dashboard}"

# Prints the first IP of a container, looked up on the VPS (compose service name -> container -> IP).
remote_ip() {
  ssh "$target" "cd ${remote_dir} && docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' \$(docker compose ps -q $1)" | awk '{print $1}'
}

mc_ip="$(remote_ip minecraft)"
proxy_ip="$(remote_ip docker-proxy)"
[[ -n "$mc_ip" && -n "$proxy_ip" ]] || { echo "Could not resolve container IPs on ${target} (is the stack running?)" >&2; exit 1; }

echo "Tunnel to ${target}: RCON ${mc_ip} -> localhost:25575, Docker proxy ${proxy_ip} -> localhost:2375 (Ctrl+C to close)"
exec ssh -N \
  -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 \
  -L "127.0.0.1:25575:${mc_ip}:25575" \
  -L "127.0.0.1:2375:${proxy_ip}:2375" \
  "$target"
