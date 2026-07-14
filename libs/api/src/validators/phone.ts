import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function isValidPhone(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  return parsePhoneNumberFromString(value)?.isValid() ?? false;
}

export function toE164(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value);

  if (!parsed?.isValid()) {
    return null;
  }

  return parsed.format('E.164');
}
