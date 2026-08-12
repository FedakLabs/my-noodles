import { logger } from '@my-noodles/api-lib/logger';

/** Postgres SQLSTATEs commonly seen while a serverless compute is waking / restarting. */
const TRANSIENT_SQLSTATES = new Set([
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08003', // connection_does_not_exist
  '08004', // sqlserver_rejected_establishment_of_sqlconnection
  '08006', // connection_failure
  '57P01', // admin_shutdown
  '57P03', // cannot_connect_now
]);

/** Node / libpq-style codes that show up during cold start or dropped pooled clients. */
const TRANSIENT_NODE_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN']);

const TRANSIENT_MESSAGE_SNIPPETS = [
  'connection terminated unexpectedly',
  'terminating connection due to administrator command',
  'client has encountered a connection error and is not queryable',
  "couldn't connect to compute node",
  'connection timeout',
  'timeout exceeded when trying to connect',
  'server closed the connection',
  'the database system is starting up',
  'the database system is shutting down',
  'cannot connect now',
  'connection terminated due to connection timeout',
  'sorry, too many clients already',
] as const;

export type ServerlessDbRetryOptions = Readonly<{
  /** Total attempts including the first try. Default 5. */
  retries?: number;
  /** Initial backoff delay. Default 250ms. */
  minDelayMs?: number;
  /** Backoff cap. Default 4000ms. */
  maxDelayMs?: number;
  /** Exponential factor. Default 2. */
  factor?: number;
}>;

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  cause?: unknown;
};

/**
 * Helpers for serverless Postgres (cold start / scale-to-zero).
 * Stateless — use the static methods; do not instantiate.
 */
export class ServerlessDbUtils {
  private constructor() {}

  /** True when the failure looks like a serverless DB wake / dropped connection, not app/SQL logic. */
  static isTransientError(this: void, error: unknown): boolean {
    for (const entry of ServerlessDbUtils.collectErrorChain(error)) {
      if (typeof entry.code === 'string') {
        const code = entry.code;
        if (TRANSIENT_SQLSTATES.has(code) || TRANSIENT_NODE_CODES.has(code)) {
          return true;
        }
      }

      if (typeof entry.message === 'string' && ServerlessDbUtils.matchesTransientMessage(entry.message)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retries an async DB operation when the error is a serverless-compute / connection transient.
   * Does not retry constraint, auth, or query logic failures.
   */
  static async retryOnTransientError<T>(
    this: void,
    operation: () => Promise<T>,
    options: ServerlessDbRetryOptions = {},
  ): Promise<T> {
    const retries = options.retries ?? 5;
    const minDelayMs = options.minDelayMs ?? 250;
    const maxDelayMs = options.maxDelayMs ?? 4000;
    const factor = options.factor ?? 2;

    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (!ServerlessDbUtils.isTransientError(error) || attempt >= retries) {
          throw error;
        }

        const delayMs = ServerlessDbUtils.backoffDelayMs(attempt, minDelayMs, maxDelayMs, factor);
        logger.warn({
          msg: 'database.serverless_transient_retry',
          attempt,
          retries,
          delayMs,
          error: error instanceof Error ? error.message : String(error),
        });
        await ServerlessDbUtils.sleep(delayMs);
      }
    }

    throw lastError;
  }

  private static asErrorLike(error: unknown): ErrorLike | undefined {
    return error !== null && typeof error === 'object' ? (error as ErrorLike) : undefined;
  }

  private static collectErrorChain(error: unknown): ErrorLike[] {
    const chain: ErrorLike[] = [];
    const seen = new Set<unknown>();
    let current: unknown = error;

    while (current && typeof current === 'object' && !seen.has(current)) {
      seen.add(current);
      const like = ServerlessDbUtils.asErrorLike(current);
      if (like) {
        chain.push(like);
      }
      current = like?.cause;
    }

    return chain;
  }

  private static matchesTransientMessage(message: string): boolean {
    const normalized = message.toLowerCase();
    return TRANSIENT_MESSAGE_SNIPPETS.some((snippet) => normalized.includes(snippet));
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private static backoffDelayMs(
    attempt: number,
    minDelayMs: number,
    maxDelayMs: number,
    factor: number,
  ): number {
    const exp = minDelayMs * factor ** Math.max(0, attempt - 1);
    const capped = Math.min(maxDelayMs, exp);
    // Full jitter: [0, capped]
    return Math.floor(Math.random() * (capped + 1));
  }
}
