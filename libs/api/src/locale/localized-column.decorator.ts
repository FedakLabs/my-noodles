import { Exclude, Type } from 'class-transformer';
import { Column, type ColumnOptions } from 'typeorm';

import { LocalizedString } from './localized-string';
import { localizedStringTransformer } from './localized-string.transformer';

export type LocalizedColumnOptions = Pick<ColumnOptions, 'name' | 'nullable'>;

/** JSONB storage for a {@link LocalizedString}. Excluded from storefront serialization. */
export function LocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Exclude()(target, propertyKey);
    Column({
      type: 'jsonb',
      transformer: localizedStringTransformer,
      ...options,
    })(target, propertyKey);
    Type(() => LocalizedString)(target, propertyKey);
  };
}
