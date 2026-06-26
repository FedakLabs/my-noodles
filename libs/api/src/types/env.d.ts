declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    NODE_ENV?: string;
    POSTGRES_HOST?: string;
    POSTGRES_PORT?: string;
    POSTGRES_USER?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DB?: string;
    DATABASE_LOGGING?: string;
    OTEL_ENABLED?: string;
    OTEL_EXPORTER_OTLP_ENDPOINT?: string;
    OTEL_SERVICE_NAME?: string;
    SHUTDOWN_TIMEOUT_MS?: string;
    APP_NAME?: string;
    APP_VERSION?: string;
    API_RESPONSE_DELAY_MS?: string;
  }
}
