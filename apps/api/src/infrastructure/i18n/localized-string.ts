import { Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import {
  DEFAULT_LOCALE,
  type Locale,
  type LocalizedStringData,
  type LocalizedStringRecord,
  SUPPORTED_LOCALES,
} from './locale.config';
import { LocaleContext } from './locale.context';

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type -- locale keys come from `SUPPORTED_LOCALES` via Object.assign in the constructor */
export class LocalizedString {
  constructor(values: LocalizedStringData | LocalizedStringRecord) {
    Object.assign(this, values);
  }

  /** String for the active request locale (AsyncLocalStorage), or `null` when missing. */
  get localized(): string | null {
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
  ): string | null {
    return (data as LocalizedStringRecord)[locale] ?? null;
  }

  toJSON(): LocalizedStringData {
    const values = this as LocalizedStringRecord;
    const result = { [DEFAULT_LOCALE]: values[DEFAULT_LOCALE]! } as LocalizedStringData;

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === DEFAULT_LOCALE) {
        continue;
      }

      const value = values[locale];
      if (value !== undefined) {
        result[locale] = value;
      }
    }

    return result;
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
