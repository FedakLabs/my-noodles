import { Type } from 'class-transformer';
import { Column, type ColumnOptions } from 'typeorm';

import { LocalizedString } from './localized-string';
import { localizedStringTransformer } from './localized-string.transformer';

type LocalizedColumnOptions = Pick<ColumnOptions, 'name' | 'nullable'>;

/**
 * TypeORM JSONB column + class-transformer metadata.
 *
 * TypeORM hydrates via `localizedStringTransformer` (not `@Type` alone).
 * `@Type(() => LocalizedString)` is included for `plainToInstance` / DTO flows.
 */
export function LocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Column({
      type: 'jsonb',
      transformer: localizedStringTransformer,
      ...options,
    })(target, propertyKey);

    Type(() => LocalizedString)(target, propertyKey);
  };
}
