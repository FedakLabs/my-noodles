export type ExternalApiLogger = {
  log(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
};

export function createConsoleExternalApiLogger(serviceName: string): ExternalApiLogger {
  return {
    log(message, meta) {
      console.log(`[${serviceName}] ${message}`, meta ?? '');
    },
    error(message, meta) {
      console.error(`[${serviceName}] ${message}`, meta ?? '');
    },
  };
}
