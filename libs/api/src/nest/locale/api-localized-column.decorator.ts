import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { LocalizedColumn, type LocalizedColumnOptions } from '../../locale';

/** {@link LocalizedColumn} + OpenAPI `string | null` (resolved locale on the wire). */
export function ApiLocalizedColumn(options?: LocalizedColumnOptions): PropertyDecorator {
  return applyDecorators(LocalizedColumn(options), ApiProperty({ type: String, nullable: true }));
}
