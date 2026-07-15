import { IsInt, Max, Min } from 'class-validator';

import { TransformToInt } from '../transformers';
import type { PaginationMeta, PaginationQuery } from './pagination';

export class PaginationQueryDto implements PaginationQuery {
  @TransformToInt()
  @IsInt()
  @Min(1)
  page!: number;

  @TransformToInt()
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}

/** Nest/swagger DTO mirror of `@my-noodles/api-lib` pagination meta. */
export class PaginationMetaDto implements PaginationMeta {
  /** Total items matching the query across all pages. */
  total!: number;

  /** Number of items returned on the current page. */
  currentTotal!: number;

  page!: number;

  limit!: number;
}

export class PaginatedMetaDto {
  meta!: PaginationMetaDto;
}
