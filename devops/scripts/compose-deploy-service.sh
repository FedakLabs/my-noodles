#!/usr/bin/env bash
# Pull and restart one Compose service on the app host.
# Used by deploy-web / deploy-api (via .github/actions/deploy-compose-service).
#
# Env: SERVICE (web|api), IMAGE_TAG, GHCR_OWNER, GHCR_TOKEN
# Optional: DEPLOY_PATH (default /opt/my-noodles)

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/my-noodles}"

case "$SERVICE" in
  web) IMAGE_TAG_KEY=WEB_IMAGE_TAG ;;
  api) IMAGE_TAG_KEY=API_IMAGE_TAG ;;
  *)
    echo "SERVICE must be web or api (got: ${SERVICE:-})" >&2
    exit 1
    ;;
esac

upsert_env() {
  local key="$1" val="$2"
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
}

# Caddy depends_on healthy web+api. Start it once both can satisfy healthchecks;
# a single-service deploy must still succeed if the other app is not up yet.
ensure_caddy() {
  if docker compose -f compose.prod.yml up -d --wait caddy; then
    docker compose -f compose.prod.yml exec -T caddy \
      caddy reload --config /etc/caddy/Caddyfile || true
    echo "Caddy is up"
    return 0
  fi
  echo "Caddy not started yet (needs healthy web + api) — deploy the other service or re-run"
}

cd "$DEPLOY_PATH"
test -f .env && test -f compose.prod.yml

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_OWNER" --password-stdin
upsert_env "$IMAGE_TAG_KEY" "$IMAGE_TAG"
upsert_env GHCR_OWNER "$GHCR_OWNER"

docker compose -f compose.prod.yml up -d --no-deps --pull always --wait "$SERVICE"
echo "Deployed ${SERVICE} @ ${IMAGE_TAG}"

ensure_caddy
