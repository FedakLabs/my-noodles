import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import {
  parseIntQuery,
  parseOptionalBoolean,
  parseOptionalIntQuery,
  parseStringArray,
} from '@/utils/transformers';

import type { ProductSort } from './products.filters';

export class ListProductsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  category?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  country?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalIntQuery(value))
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalIntQuery(value))
  @IsInt()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isTriedByUs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ enum: ['popular', 'new', 'price-asc', 'price-desc'] })
  @IsOptional()
  @IsIn(['popular', 'new', 'price-asc', 'price-desc'])
  sort?: ProductSort;

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

export class ProductFacetsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  category?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  country?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalIntQuery(value))
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalIntQuery(value))
  @IsInt()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  isTriedByUs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ enum: ['popular', 'new', 'price-asc', 'price-desc'] })
  @IsOptional()
  @IsIn(['popular', 'new', 'price-asc', 'price-desc'])
  sort?: ProductSort;
}

export class ProductSummaryDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string | null;

  @ApiProperty()
  priceMinor!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ type: [String] })
  images!: string[];

  @ApiProperty()
  inStock!: boolean;

  @ApiProperty()
  isTriedByUs!: boolean;

  @ApiProperty()
  sortWeight!: number;

  @ApiPropertyOptional({ nullable: true })
  brand!: { slug: string; name: string } | null;

  @ApiProperty()
  country!: { slug: string; code: string; name: string | null };

  @ApiProperty()
  category!: { slug: string; name: string | null };
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductSummaryDto] })
  items!: ProductSummaryDto[];

  @ApiProperty()
  total!: number;
}

export class ProductFlavorDto {
  @ApiProperty()
  spice!: number;

  @ApiProperty()
  sweet!: number;

  @ApiProperty()
  texture!: string;
}

export class ProductDetailDto extends ProductSummaryDto {
  @ApiPropertyOptional({ nullable: true })
  weight!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  story!: string | null;

  @ApiProperty({ nullable: true })
  forWhom!: string | null;

  @ApiProperty({ type: ProductFlavorDto })
  flavor!: ProductFlavorDto;

  @ApiProperty({ type: [String] })
  allergens!: string[];

  @ApiProperty({ type: [ProductSummaryDto] })
  alternatives!: ProductSummaryDto[];
}

export class FacetOptionDto {
  @ApiProperty()
  value!: string;

  @ApiProperty({ nullable: true })
  label!: string | null;

  @ApiProperty()
  count!: number;
}

export class PriceFacetDto {
  @ApiProperty()
  min!: number;

  @ApiProperty()
  max!: number;
}

export class ProductFacetsDto {
  @ApiProperty({ type: [FacetOptionDto] })
  category!: FacetOptionDto[];

  @ApiProperty({ type: [FacetOptionDto] })
  country!: FacetOptionDto[];

  @ApiProperty({ type: PriceFacetDto })
  price!: PriceFacetDto;

  @ApiProperty()
  isTriedByUs!: number;

  @ApiProperty()
  inStock!: number;
}

export class ProductFacetsResponseDto {
  @ApiProperty()
  total!: number;

  @ApiProperty({ type: ProductFacetsDto })
  facets!: ProductFacetsDto;
}
