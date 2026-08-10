#!/usr/bin/env bash
# Sync compose + Caddyfile, write Origin CA + .env on app host(s).
# Intended for CI (bootstrap-host / tofu) — never put secrets in cloud-init.
#
# Env (set by bootstrap-host.yml):
#   DEPLOY_SSH_HOST, DEPLOY_SSH_USER, DEPLOY_SSH_KEY (key file path)
#   GHCR_OWNER, DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
#   Optional: ORIGIN_CA_*, WEB/API_IMAGE_TAG, S3_*, CDN_*, TELEGRAM_*, TAWK_*, OTEL_*, SENTRY_*, …

set -euo pipefail

SSH_USER="${DEPLOY_SSH_USER:-deploy}"
HOSTS_CSV="$DEPLOY_SSH_HOST"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/my-noodles}"
KEY="$DEPLOY_SSH_KEY"
PLACEHOLDER_TAG="sha-0000000"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$KEY")

cleanup() { rm -f "${TMP_ENV:-}"; }
trap cleanup EXIT
umask 077

# OTEL requires an endpoint; never enable by default without one (API Config validates).
OTEL_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-}"
if [[ -n "$OTEL_ENDPOINT" ]]; then
  OTEL_ENABLED_EFFECTIVE="${OTEL_ENABLED:-true}"
else
  OTEL_ENABLED_EFFECTIVE="false"
fi

# Sentry requires a DSN; never enable by default without one (API Config validates).
SENTRY_DSN_VALUE="${SENTRY_DSN:-}"
if [[ -n "$SENTRY_DSN_VALUE" ]]; then
  SENTRY_ENABLED_EFFECTIVE="${SENTRY_ENABLED:-true}"
else
  SENTRY_ENABLED_EFFECTIVE="false"
fi

remote_env_value() {
  local host="$1" key="$2"
  ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" \
    "grep -E '^${key}=' '${DEPLOY_PATH}/.env' 2>/dev/null | head -n1 | cut -d= -f2-" || true
}

resolve_image_tag() {
  local host="$1" key="$2" provided="$3"
  if [[ -n "$provided" && "$provided" != "$PLACEHOLDER_TAG" ]]; then
    printf '%s' "$provided"
    return 0
  fi
  local existing
  existing="$(remote_env_value "$host" "$key")"
  if [[ -n "$existing" && "$existing" != "$PLACEHOLDER_TAG" ]]; then
    printf '%s' "$existing"
    return 0
  fi
  printf '%s' "$PLACEHOLDER_TAG"
}

write_env_file() {
  local web_tag="$1" api_tag="$2" out="$3"
  {
    printf 'GHCR_OWNER=%s\n' "$GHCR_OWNER"
    printf 'WEB_IMAGE_TAG=%s\n' "$web_tag"
    printf 'API_IMAGE_TAG=%s\n' "$api_tag"
    printf 'DATABASE_URL=%s\n' "$DATABASE_URL"
    printf 'APP_NAME=%s\n' "${APP_NAME:-my-noodles-api}"
    printf 'APP_VERSION=%s\n' "${APP_VERSION:-prod}"
    printf 'JWT_SECRET=%s\n' "$JWT_SECRET"
    printf 'ADMIN_EMAIL=%s\n' "$ADMIN_EMAIL"
    printf 'ADMIN_PASSWORD=%s\n' "$ADMIN_PASSWORD"
    printf 'TELEGRAM_BOT_TOKEN=%s\n' "${TELEGRAM_BOT_TOKEN:-}"
    printf 'TELEGRAM_CHAT_ID=%s\n' "${TELEGRAM_CHAT_ID:-}"
    printf 'TAWK_API_KEY=%s\n' "${TAWK_API_KEY:-}"
    printf 'TAWK_PROPERTY_ID=%s\n' "${TAWK_PROPERTY_ID:-}"
    printf 'TAWK_WIDGET_ID=%s\n' "${TAWK_WIDGET_ID:-}"
    printf 'NOVA_POSHTA_API_KEY=%s\n' "${NOVA_POSHTA_API_KEY:-}"
    printf 'OTEL_ENABLED=%s\n' "$OTEL_ENABLED_EFFECTIVE"
    printf 'OTEL_SERVICE_NAME=%s\n' "${OTEL_SERVICE_NAME:-my-noodles-api}"
    printf 'OTEL_EXPORTER_OTLP_ENDPOINT=%s\n' "$OTEL_ENDPOINT"
    printf 'OTEL_EXPORTER_OTLP_HEADERS=%s\n' "${OTEL_EXPORTER_OTLP_HEADERS:-}"
    printf 'SENTRY_ENABLED=%s\n' "$SENTRY_ENABLED_EFFECTIVE"
    printf 'SENTRY_DSN=%s\n' "$SENTRY_DSN_VALUE"
    printf 'S3_ENDPOINT=%s\n' "${S3_ENDPOINT:-}"
    printf 'S3_REGION=%s\n' "${S3_REGION:-}"
    printf 'S3_ACCESS_KEY=%s\n' "${S3_ACCESS_KEY:-}"
    printf 'S3_SECRET_KEY=%s\n' "${S3_SECRET_KEY:-}"
    printf 'S3_BUCKET=%s\n' "${S3_BUCKET:-}"
    printf 'CDN_PUBLIC_BASE_URL=%s\n' "${CDN_PUBLIC_BASE_URL:-}"
  } >"$out"
}

IFS=',' read -r -a HOSTS <<<"$HOSTS_CSV"

bootstrap_host() {
  local host="$1"
  local web_tag api_tag
  echo "==> Bootstrapping ${SSH_USER}@${host}:${DEPLOY_PATH}"

  ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" \
    "mkdir -p '${DEPLOY_PATH}/certs' && chmod 750 '${DEPLOY_PATH}' '${DEPLOY_PATH}/certs'"

  scp "${SSH_OPTS[@]}" \
    "$ROOT/devops/compose/compose.prod.yml" \
    "$ROOT/devops/caddy/Caddyfile" \
    "${SSH_USER}@${host}:${DEPLOY_PATH}/"

  if [[ -n "${ORIGIN_CA_CERTIFICATE_PEM:-}" && -n "${ORIGIN_CA_PRIVATE_KEY_PEM:-}" ]]; then
    printf '%s\n' "${ORIGIN_CA_CERTIFICATE_PEM}" |
      ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" \
        "cat > '${DEPLOY_PATH}/certs/origin.pem' && chmod 644 '${DEPLOY_PATH}/certs/origin.pem'"
    printf '%s\n' "${ORIGIN_CA_PRIVATE_KEY_PEM}" |
      ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" \
        "cat > '${DEPLOY_PATH}/certs/origin.key' && chmod 600 '${DEPLOY_PATH}/certs/origin.key'"
    echo "Wrote Origin CA certs"
  else
    echo "Skipping Origin CA (ORIGIN_CA_* not set)"
  fi

  web_tag="$(resolve_image_tag "$host" WEB_IMAGE_TAG "${WEB_IMAGE_TAG:-}")"
  api_tag="$(resolve_image_tag "$host" API_IMAGE_TAG "${API_IMAGE_TAG:-}")"
  echo "Image tags: WEB_IMAGE_TAG=${web_tag} API_IMAGE_TAG=${api_tag}"

  TMP_ENV="$(mktemp)"
  write_env_file "$web_tag" "$api_tag" "$TMP_ENV"
  scp "${SSH_OPTS[@]}" "$TMP_ENV" "${SSH_USER}@${host}:${DEPLOY_PATH}/.env"
  ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" "chmod 600 '${DEPLOY_PATH}/.env'"
  rm -f "$TMP_ENV"
  TMP_ENV=""

  # Caddy needs healthy web+api images — deploy workflows call ensure_caddy.
  # Reload here when caddy is already running so Caddyfile/cert sync takes effect.
  ssh "${SSH_OPTS[@]}" "${SSH_USER}@${host}" "bash -s" <<EOF
set -euo pipefail
cd '${DEPLOY_PATH}'
if docker compose -f compose.prod.yml ps --status running -q caddy 2>/dev/null | grep -q .; then
  docker compose -f compose.prod.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile || true
  echo "Reloaded Caddy"
else
  echo "Caddy not running yet — will start on deploy-web/deploy-api once both apps are healthy"
fi
EOF

  echo "Done: ${host}"
}

for host in "${HOSTS[@]}"; do
  host="$(echo "$host" | xargs)"
  [[ -n "$host" ]] || continue
  bootstrap_host "$host"
done

echo "Host bootstrap complete"
