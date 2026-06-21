import type { PaginationMeta, PaginationQuery } from '@my-noodles/api-lib/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

import { parseIntQuery } from '@/utils/transformers';

/** Nest/swagger DTO mirror of `@my-noodles/api-lib` pagination meta. */
export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ description: 'Total items matching the query across all pages' })
  total!: number;

  @ApiProperty({ description: 'Number of items returned on the current page' })
  currentTotal!: number;

  @ApiProperty({ minimum: 1 })
  page!: number;

  @ApiProperty({ minimum: 1, maximum: 100 })
  limit!: number;
}

export class PaginationQueryDto implements PaginationQuery {
  @ApiProperty({ minimum: 1 })
  @Transform(({ value }) => parseIntQuery(value))
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @Transform(({ value }) => parseIntQuery(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}

export class PaginatedMetaDto {
  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
