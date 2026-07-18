import { Transform, Type } from 'class-transformer';
import { Column, type ColumnOptions } from 'typeorm';

import { LocalizedString } from './localized-string';
import { localizedStringTransformer } from './localized-string.transformer';

export type LocalizedColumnOptions = Pick<ColumnOptions, 'name' | 'nullable'>;

export function LocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Column({
      type: 'jsonb',
      transformer: localizedStringTransformer,
      ...options,
    })(target, propertyKey);

    Type(() => LocalizedString)(target, propertyKey);
    Transform(
      ({ value }: { value: unknown }) =>
        value === null || value === undefined
          ? null
          : LocalizedString.from(value as LocalizedString).localized,
      { toPlainOnly: true },
    )(target, propertyKey);
  };
}
