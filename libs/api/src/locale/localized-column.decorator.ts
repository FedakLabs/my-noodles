import { Expose, Transform, Type } from 'class-transformer';
import { Column, type ColumnOptions } from 'typeorm';

import { LocalizedString } from './localized-string';
import { localizedStringTransformer } from './localized-string.transformer';

export type LocalizedColumnOptions = Pick<ColumnOptions, 'name' | 'nullable'>;

/** JSONB storage for a {@link LocalizedString} — exposed on the wire as a full locale map. */
export function LocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Expose()(target, propertyKey);
    Transform(
      ({ value }: { value: unknown }) => (value instanceof LocalizedString ? value.toJSON() : value),
      { toPlainOnly: true },
    )(target, propertyKey);
    Column({
      type: 'jsonb',
      transformer: localizedStringTransformer,
      ...options,
    })(target, propertyKey);
    Type(() => LocalizedString)(target, propertyKey);
  };
}
