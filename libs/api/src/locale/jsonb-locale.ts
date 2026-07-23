import { Raw } from 'typeorm';

import { SUPPORTED_LOCALES } from './locale.config';

/**
 * TypeORM `Raw` that matches a JSONB locale map against any supported locale key
 * (`alias->>'uk' ILIKE … OR alias->>'en' ILIKE …`).
 */
export function jsonbAnyLocaleIlike(pattern: string) {
  return Raw(
    (alias) => `(${SUPPORTED_LOCALES.map((locale) => `${alias}->>'${locale}' ILIKE :pattern`).join(' OR ')})`,
    { pattern },
  );
}
