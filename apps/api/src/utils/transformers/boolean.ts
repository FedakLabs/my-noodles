import { Transform } from 'class-transformer';

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

/** Optional boolean — returns `undefined` when absent or unrecognized. */
function parseOptionalBoolean(value: unknown): boolean | undefined {
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

export function TransformToOptionalBoolean(): PropertyDecorator {
  return Transform(({ value }) => parseOptionalBoolean(value), { toClassOnly: true });
}
