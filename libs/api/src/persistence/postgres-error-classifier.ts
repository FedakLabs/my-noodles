type ErrorLike = {
  code?: unknown;
  cause?: unknown;
};

const TRANSIENT_SQLSTATES = new Set(['08001', '08003', '08004', '08006', '57P01', '57P03']);
const TRANSIENT_NODE_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN']);

/** Identifies connection failures that may recover after a PostgreSQL compute wakes up. */
export class PostgresErrorClassifier {
  private constructor() {}

  static isTransient(this: void, error: unknown): boolean {
    const seen = new Set<unknown>();
    let current: unknown = error;

    while (current && typeof current === 'object' && !seen.has(current)) {
      seen.add(current);
      const entry = current as ErrorLike;

      if (typeof entry.code === 'string') {
        if (TRANSIENT_SQLSTATES.has(entry.code) || TRANSIENT_NODE_CODES.has(entry.code)) {
          return true;
        }
      }

      current = entry.cause;
    }

    return false;
  }
}
