# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.mynoodles.shop \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://mynoodles.shop \
#     -t my-noodles-web .

# Chainguard Wolfi builder — pin digest (latest-dev floats). Refresh: docker pull … && docker inspect.
FROM cgr.dev/chainguard/node:latest-dev@sha256:1bd1aa2a03ffd28fff8f99f1330bbf3080e03d5c76e4758572a403dd71baa9e8 AS base
USER root
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GTM_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm nx run web:build

# Distroless runtime: no shell/npm/apt.
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=build --chown=65532:65532 /app/apps/web/public ./apps/web/public
COPY --from=build --chown=65532:65532 /app/apps/web/.next/standalone ./
COPY --from=build --chown=65532:65532 /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
WORKDIR /app/apps/web

# ENTRYPOINT is /nodejs/bin/node — pass script path only (not "node server.js").
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3000/api/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["server.js"]
