# Observability — Grafana Cloud (OTLP) + Sentry

## Split

| Concern                                 | Tool                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Traces / logs / metrics (API)           | **Grafana Cloud** via OTLP                                                                  |
| Errors / exceptions (API + web + admin) | **Sentry**                                                                                  |
| Product analytics (storefront)          | **GTM / GA4** (not errors — see [`docs/analytics-setup.md`](../../docs/analytics-setup.md)) |

Local OTEL: `otel-lgtm` in root `docker-compose.yml` (ports 4317/4318, UI 3030).

Prod OTEL: **Grafana Cloud Free** — logs + traces + metrics over the same OTLP endpoint. No self-hosted Loki/Tempo on Hetzner.

## API env (GH `prod` → VM)

```bash
# Enable only together with a real OTLP endpoint (bootstrap forces false when endpoint is empty).
OTEL_ENABLED=true
OTEL_SERVICE_NAME=my-noodles-api
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-…grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20<base64>

# Enable only together with a real Sentry DSN (bootstrap forces false when DSN is empty).
SENTRY_ENABLED=true
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
```

`prepareInstrumentation` sets:

- `OTEL_TRACES_EXPORTER=otlp`
- `OTEL_LOGS_EXPORTER=otlp`
- `OTEL_METRICS_EXPORTER=otlp`

NodeSDK auto-instrumentations export HTTP/runtime metrics to the same endpoint (Grafana Mimir/Prometheus).

`prepareSentry` initializes `@sentry/node` when enabled. The shared Nest `ExceptionsFilter` reports **status ≥ 500** only.

## Frontend env (build-time)

| App   | Var                      | Where                                  |
| ----- | ------------------------ | -------------------------------------- |
| web   | `NEXT_PUBLIC_SENTRY_DSN` | GH `prod` var → Docker build-args      |
| admin | `VITE_SENTRY_DSN`        | GH `prod` var → deploy-admin build env |

Create separate Sentry projects (`my-noodles-api`, `my-noodles-web`, `my-noodles-admin`) with distinct DSNs. Browser DSNs are public; the API DSN stays a server secret.

Sentry is **not** consent-gated (operational errors ≠ marketing analytics).

## Uptime

Separate from app telemetry: ping `mynoodles.shop` / `api.mynoodles.shop` (Cloudflare or Better Stack free).
