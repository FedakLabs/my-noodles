import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/** OpenAPI + serialization for a resolved locale string getter (always present). */
export function LocalizedResolved(): PropertyDecorator {
  return applyDecorators(Expose(), ApiProperty({ type: String }));
}
