const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSY_VALUES = new Set(['0', 'false', 'no', 'off']);

function normalizeBooleanInput(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim().toLowerCase();
  }

  return undefined;
}

/** Coerce env/query scalars to boolean; unknown or missing values use `defaultValue`. */
export function parseBoolean(value: unknown, defaultValue = false): boolean {
  const normalized = normalizeBooleanInput(value);
  if (normalized === undefined) {
    return defaultValue;
  }

  if (TRUTHY_VALUES.has(normalized)) {
    return true;
  }

  if (FALSY_VALUES.has(normalized)) {
    return false;
  }

  return defaultValue;
}

/** Coerce optional query params to boolean; returns `undefined` when absent or unrecognized. */
export function parseOptionalBoolean(value: unknown): boolean | undefined {
  const normalized = normalizeBooleanInput(value);
  if (normalized === undefined) {
    return undefined;
  }

  if (TRUTHY_VALUES.has(normalized)) {
    return true;
  }

  if (FALSY_VALUES.has(normalized)) {
    return false;
  }

  return undefined;
}

/** Coerce a single query value or array into `string[]` for filter params. */
export function parseStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
      .map(String);
  }

  if (typeof value === 'string') {
    return [value];
  }

  return undefined;
}

/** Coerce query/path integers — explicit transform for tsx dev (no `@Type()` metadata). */
export function parseIntQuery(value: unknown): unknown {
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

/** Optional integer query param — returns `undefined` when absent or invalid. */
export function parseOptionalIntQuery(value: unknown): number | undefined {
  const parsed = parseIntQuery(value);
  return typeof parsed === 'number' ? parsed : undefined;
}
