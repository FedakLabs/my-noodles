import {
  DEFAULT_LOCALE,
  type Locale,
  type LocalizedStringData,
  type LocalizedStringRecord,
  SUPPORTED_LOCALES,
} from '@my-noodles/locale';
import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { LocaleContext } from './locale.context';

/* oxlint-disable typescript/no-unsafe-declaration-merging, typescript/no-empty-object-type -- locale keys come from `SUPPORTED_LOCALES` via Object.assign in the constructor */
export class LocalizedString {
  constructor(values: LocalizedStringData | LocalizedStringRecord) {
    Object.assign(this, values);
  }

  /** String for the active request locale (AsyncLocalStorage), falling back to `DEFAULT_LOCALE`. */
  get localized(): string {
    return LocalizedString.resolveFor(this, LocaleContext.get());
  }

  static from(data: LocalizedStringData | LocalizedString): LocalizedString {
    if (data instanceof LocalizedString) {
      return data;
    }

    return new LocalizedString(data);
  }

  static resolveFor(
    data: LocalizedStringData | LocalizedStringRecord | LocalizedString,
    locale: Locale,
  ): string {
    const values = data as LocalizedStringRecord;
    return values[locale] ?? values[DEFAULT_LOCALE] ?? '';
  }

  toJSON(): LocalizedStringData {
    const values = this as LocalizedStringRecord;
    return Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [locale, values[locale] ?? values[DEFAULT_LOCALE] ?? '']),
    ) as LocalizedStringData;
  }
}

export interface LocalizedString extends LocalizedStringRecord {}

/** class-transformer hook — hydrates plain JSON into `LocalizedString` (DTOs / manual transforms). */
export function localizedStringTransform({ value }: { value: unknown }): LocalizedString | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }

  return LocalizedString.from(value as LocalizedStringData);
}

/** DTO fields: validate nested shape and hydrate via `LocalizedString.from`. */
export function LocalizedField(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Type(() => LocalizedString)(target, propertyKey);
    Transform(localizedStringTransform)(target, propertyKey);
    ValidateNested()(target, propertyKey);
  };
}
