import {
  PaginatedMetaDto,
  PaginationMetaDto as BasePaginationMetaDto,
  PaginationQueryDto,
} from '@my-noodles/api-lib/utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-visible pagination query params (validators inherited from api-lib). */
export class PaginationQuerySwaggerDto extends PaginationQueryDto {
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  declare page: number;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 24 })
  declare limit: number;
}

class PaginationMetaDto extends BasePaginationMetaDto {
  @ApiProperty()
  declare total: number;

  @ApiProperty()
  declare currentTotal: number;

  @ApiProperty()
  declare page: number;

  @ApiProperty()
  declare limit: number;
}

export class PaginatedMetaSwaggerDto extends PaginatedMetaDto {
  @ApiProperty({ type: () => PaginationMetaDto })
  declare meta: BasePaginationMetaDto;
}
