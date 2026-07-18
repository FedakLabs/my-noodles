/** OpenTelemetry severity numbers for structured log `severity.number`. */
export const SEVERITY = {
  TRACE: { text: 'TRACE', number: 1 },
  DEBUG: { text: 'DEBUG', number: 5 },
  INFO: { text: 'INFO', number: 9 },
  WARN: { text: 'WARN', number: 13 },
  ERROR: { text: 'ERROR', number: 17 },
} as const;

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

export type ResolveSeverityInput = Readonly<{
  status?: number;
  error?: unknown;
  level?: string;
}>;

export function resolveSeverity({ status, error, level }: ResolveSeverityInput = {}): Severity {
  if (level !== undefined) {
    switch (level.toLowerCase()) {
      case 'error':
        return SEVERITY.ERROR;
      case 'warn':
      case 'warning':
        return SEVERITY.WARN;
      case 'debug':
      case 'http':
        return SEVERITY.DEBUG;
      case 'silly':
      case 'verbose':
        return SEVERITY.TRACE;
      default:
        return SEVERITY.INFO;
    }
  }

  if (error !== undefined && (status === undefined || status < 400)) {
    return SEVERITY.ERROR;
  }

  if (status !== undefined) {
    return status >= 500 ? SEVERITY.ERROR : SEVERITY.INFO;
  }

  return SEVERITY.INFO;
}
