#!/usr/bin/env bash
# Rolling deploy of one Compose service across all app hosts (CSV).
# Used by .github/actions/deploy-compose-service.
#
# Env: SERVICE, IMAGE_TAG, GHCR_OWNER, GHCR_TOKEN
#      DEPLOY_SSH_HOST (comma-separated), DEPLOY_SSH_USER, DEPLOY_SSH_KEY (key file)
# Optional: DEPLOY_PATH (default /opt/my-noodles)
# Repo root must be cwd (or set ROOT).

set -euo pipefail

SSH_USER="${DEPLOY_SSH_USER:-deploy}"
HOSTS_CSV="${DEPLOY_SSH_HOST:?DEPLOY_SSH_HOST required (comma-separated app IPs)}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/my-noodles}"
KEY="${DEPLOY_SSH_KEY:?DEPLOY_SSH_KEY required}"
SERVICE="${SERVICE:?SERVICE required}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG required}"
GHCR_OWNER="${GHCR_OWNER:?GHCR_OWNER required}"
GHCR_TOKEN="${GHCR_TOKEN:?GHCR_TOKEN required}"

ROOT="${ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$KEY")

IFS=',' read -r -a HOSTS <<<"$HOSTS_CSV"

deploy_host() {
  local host="$1"
  echo "==> Rolling deploy ${SERVICE}@${IMAGE_TAG} → ${SSH_USER}@${host}"

  scp "${SSH_OPTS[@]}" \
    "$ROOT/devops/compose/compose.prod.yml" \
    "$ROOT/devops/caddy/Caddyfile" \
    "$ROOT/devops/scripts/compose-deploy-service.sh" \
    "${SSH_USER}@${host}:${DEPLOY_PATH}/"

  ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" \
    "chmod +x '${DEPLOY_PATH}/compose-deploy-service.sh'"

  # Remote env for compose-deploy-service.sh
  ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" \
    "env SERVICE='${SERVICE}' IMAGE_TAG='${IMAGE_TAG}' GHCR_OWNER='${GHCR_OWNER}' GHCR_TOKEN='${GHCR_TOKEN}' DEPLOY_PATH='${DEPLOY_PATH}' bash '${DEPLOY_PATH}/compose-deploy-service.sh'"

  echo "OK: ${host}"
}

for host in "${HOSTS[@]}"; do
  host="$(echo "$host" | xargs)"
  [[ -n "$host" ]] || continue
  deploy_host "$host"
done

echo "Rolling deploy complete (${SERVICE} @ ${IMAGE_TAG})"
