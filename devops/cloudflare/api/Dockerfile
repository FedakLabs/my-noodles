# syntax=docker/dockerfile:1
# Build from monorepo root:
#   docker build -f devops/cloudflare/api/Dockerfile -t my-noodles-api .

# Chainguard Wolfi builder — pin digest (latest-dev floats). Refresh: docker pull … && docker inspect.
FROM cgr.dev/chainguard/node:latest-dev@sha256:1bd1aa2a03ffd28fff8f99f1330bbf3080e03d5c76e4758572a403dd71baa9e8 AS base
USER root
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm nx run api:build
RUN pnpm --filter=api deploy --prod /deploy

# Distroless runtime: no shell/npm/apt.
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
ENV NODE_ENV=prod
WORKDIR /app

COPY --from=build --chown=65532:65532 /deploy/ ./

EXPOSE 3001

# ENTRYPOINT is /nodejs/bin/node — pass node args only.
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3001/api/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["--import=./dist/instrumentation.js", "dist/index.js"]
