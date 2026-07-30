import { PaginationQueryDto } from '@my-noodles/api-lib/pagination';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginatedMetaSwaggerDto } from '@/utils/swagger';

import { Collection } from './collection.entity';

export class ListCollectionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  declare page: number;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 10 })
  declare limit: number;
}

export class PaginatedCollectionsDto extends PaginatedMetaSwaggerDto {
  @ApiProperty({ type: [Collection] })
  items!: Collection[];
}
