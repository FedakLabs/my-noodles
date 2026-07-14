export type ApiClientLogger = {
  log(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
};

export function createConsoleApiClientLogger(serviceName: string): ApiClientLogger {
  return {
    log(message, meta) {
      console.log(`[${serviceName}] ${message}`, meta ?? '');
    },
    error(message, meta) {
      console.error(`[${serviceName}] ${message}`, meta ?? '');
    },
  };
}
