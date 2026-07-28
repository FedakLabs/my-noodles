import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { LocalizedColumn as LocaleLocalizedColumn, type LocalizedColumnOptions } from '../../locale';
import { LocalizedStringSchema } from './localized-string.schema';

/** Storage column for locale JSONB — full required locale map on the wire alongside {@link LocalizedResolved} getters. */
export function LocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return applyDecorators(LocaleLocalizedColumn(options), ApiProperty({ type: () => LocalizedStringSchema }));
}

export type { LocalizedColumnOptions };
