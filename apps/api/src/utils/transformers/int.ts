import { Transform } from 'class-transformer';

/** Coerce integers while preserving invalid values for validators to reject. */
function parseToInt(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
}

/** Optional integer — returns `undefined` when absent or invalid. */
function parseOptionalInt(value: unknown): number | undefined {
  const parsed = parseToInt(value);
  return typeof parsed === 'number' ? parsed : undefined;
}

export function TransformToInt(): PropertyDecorator {
  return Transform(({ value }) => parseToInt(value), { toClassOnly: true });
}

export function TransformToOptionalInt(): PropertyDecorator {
  return Transform(({ value }) => parseOptionalInt(value), { toClassOnly: true });
}
