import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';

import { ProductDimensionFilterQueryDto } from '../products/products.filter-query.dto';

/** Grouped hashtag filters — same shape as the catalog request, reused for `buildProductWhere`. */
export class FeedFiltersDto extends ProductDimensionFilterQueryDto {}

export class FeedPreviousProductDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Dwell time on the previous product, in milliseconds.' })
  @IsInt()
  @Min(0)
  viewTime!: number;
}

export class FeedNextDto {
  @ApiPropertyOptional({ type: () => FeedPreviousProductDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeedPreviousProductDto)
  previousProduct?: FeedPreviousProductDto;

  @ApiPropertyOptional({ type: () => FeedFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeedFiltersDto)
  filters?: FeedFiltersDto;

  /** Start a fresh anonymous session — clears viewed-product memory for a new personalization pass. */
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  reshuffle?: boolean;
}

export class FeedTagRefDto {
  slug!: string;

  name!: string | null;
}

export class FeedItemDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  slug!: string;

  name!: string | null;

  priceMinor!: number;

  currency!: string;

  images!: string[];

  videos!: string[];

  inStock!: boolean;

  category!: FeedTagRefDto;

  country!: FeedTagRefDto;

  @ApiPropertyOptional({ type: () => FeedTagRefDto, nullable: true })
  brand!: FeedTagRefDto | null;

  commentCount!: number;

  liked!: boolean;
}

export class FeedNextResponseDto {
  @ApiPropertyOptional({ type: () => FeedItemDto, nullable: true })
  item!: FeedItemDto | null;

  /** True when no more products match the current filters for this session. */
  exhausted!: boolean;
}

export class FeedLikeStateDto {
  liked!: boolean;
}

export class FeedCommentDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  authorName!: string;

  comment!: string | null;
}

export class FeedLikedItemDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  slug!: string;

  name!: string | null;

  priceMinor!: number;

  currency!: string;

  images!: string[];
}
