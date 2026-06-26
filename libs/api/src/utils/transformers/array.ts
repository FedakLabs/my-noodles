import { Transform } from 'class-transformer';

/** Coerce a single value or array into an array for multi-value filters. */
function parseToArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
      .map(String);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return undefined;
}

export function TransformToArray(): PropertyDecorator {
  return Transform(({ value }) => parseToArray(value), { toClassOnly: true });
}
