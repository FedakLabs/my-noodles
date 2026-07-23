import { applyDecorators } from '@nestjs/common';
import { ApiHideProperty } from '@nestjs/swagger';

import { LocalizedColumn as LocaleLocalizedColumn, type LocalizedColumnOptions } from '../../locale';

/** Storage column for locale JSONB — hidden from OpenAPI; use {@link LocalizedResolved} getters on the wire. */
export function LocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return applyDecorators(LocaleLocalizedColumn(options), ApiHideProperty());
}

export type { LocalizedColumnOptions };
