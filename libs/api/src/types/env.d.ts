declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    NODE_ENV?: string;
    DATABASE_DRIVER?: string;
    DATABASE_URL?: string;
    DATABASE_HOST?: string;
    DATABASE_PORT?: string;
    DATABASE_USERNAME?: string;
    DATABASE_PASSWORD?: string;
    DATABASE_NAME?: string;
    DATABASE_SSL?: string;
    DATABASE_LOGGING?: string;
    OTEL_ENABLED?: string;
    OTEL_EXPORTER_OTLP_ENDPOINT?: string;
    OTEL_SERVICE_NAME?: string;
    SENTRY_ENABLED?: string;
    SENTRY_DSN?: string;
    SHUTDOWN_TIMEOUT_MS?: string;
    APP_NAME?: string;
    APP_VERSION?: string;
    API_RESPONSE_DELAY_MS?: string;
  }
}
