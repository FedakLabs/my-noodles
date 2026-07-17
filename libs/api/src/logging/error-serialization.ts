/** Max length for `attributes.error.raw` (OTel truncates long attribute values). */
export const MAX_ERROR_RAW_LENGTH = 16_384;

const MAX_CAUSE_DEPTH = 5;

/**
 * Full raw error dump for `attributes.error.raw` — name/message/stack, own props, and cause.
 * Circular-safe and size-capped; no field filtering.
 */
export function serializeErrorForObservability(
  error: unknown,
  maxLen: number = MAX_ERROR_RAW_LENGTH,
): string {
  const seen = new WeakSet<object>();
  let serialized: string;

  try {
    serialized = JSON.stringify(toPlain(error, seen, 0));
  } catch {
    return typeof error === 'string' ? error : '[unserializable]';
  }

  if (serialized.length <= maxLen) {
    return serialized;
  }

  const omitted = serialized.length - maxLen;
  return `${serialized.slice(0, maxLen)}…[truncated ${omitted} chars]`;
}

function toPlain(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => toPlain(entry, seen, depth));
  }

  if (value instanceof Error) {
    const plain: Record<string, unknown> = {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };

    for (const key of Object.getOwnPropertyNames(value)) {
      if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
        continue;
      }

      plain[key] = toPlain((value as unknown as Record<string, unknown>)[key], seen, depth);
    }

    if ('cause' in value) {
      plain.cause = depth >= MAX_CAUSE_DEPTH ? '[MaxCauseDepth]' : toPlain(value.cause, seen, depth + 1);
    }

    return plain;
  }

  const plain: Record<string, unknown> = {};

  for (const key of Object.keys(value)) {
    plain[key] = toPlain((value as Record<string, unknown>)[key], seen, depth);
  }

  return plain;
}
