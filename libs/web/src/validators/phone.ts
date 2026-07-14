import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function formatPhoneToE164(value: string): string {
  const parsed = parsePhoneNumberFromString(value);

  if (parsed?.isValid()) {
    return parsed.format('E.164');
  }

  return value;
}

export function isValidPhone(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  return parsePhoneNumberFromString(value)?.isValid() ?? false;
}
