import { logger } from '../logger';

export type DatabaseRetryOptions = Readonly<{
  attempts?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  shouldRetry?: (error: unknown) => boolean;
}>;

const DEFAULT_OPTIONS: Required<DatabaseRetryOptions> = {
  attempts: 5,
  minDelayMs: 250,
  maxDelayMs: 4000,
  factor: 2,
  shouldRetry: () => true,
};

/** Retries an operation with bounded exponential backoff. The caller owns replay safety. */
export class DatabaseRetry {
  constructor(private readonly defaults: DatabaseRetryOptions = {}) {}

  async run<T>(operation: () => Promise<T>, options: DatabaseRetryOptions = {}): Promise<T> {
    const settings = { ...DEFAULT_OPTIONS, ...this.defaults, ...options };
    let lastError: unknown;

    for (let attempt = 1; attempt <= settings.attempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (!settings.shouldRetry(error) || attempt >= settings.attempts) {
          throw error;
        }

        const delayMs = DatabaseRetry.delay(attempt, settings);
        logger.warn({
          msg: 'database.postgres.transient_retry',
          attempt,
          attempts: settings.attempts,
          delayMs,
          errorCode: getErrorCode(error),
        });
        await DatabaseRetry.sleep(delayMs);
      }
    }

    throw lastError;
  }

  private static delay(attempt: number, options: Required<DatabaseRetryOptions>): number {
    const maximum = Math.min(options.maxDelayMs, options.minDelayMs * options.factor ** (attempt - 1));
    return Math.floor(Math.random() * (maximum + 1));
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return undefined;
}
