import { SUPPORTED_LOCALES } from '@my-noodles/locale';
import { Raw } from 'typeorm';

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
