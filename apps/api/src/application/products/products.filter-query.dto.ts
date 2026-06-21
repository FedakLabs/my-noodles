import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { parseOptionalBoolean, parseOptionalIntQuery, parseStringArray } from '@/utils/transformers';

import { PRODUCT_SORT_OPENAPI, type ProductSort } from './products.filters';

/** Shared catalog filter query fields — single source for facets + list DTOs. */
export class ProductFilterQueryDto {
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
}

/** List endpoint adds sort on top of shared filter fields. */
export class ProductListFilterQueryDto extends ProductFilterQueryDto {
  @ApiPropertyOptional(PRODUCT_SORT_OPENAPI)
  @IsOptional()
  @IsIn(PRODUCT_SORT_OPENAPI.enum)
  sort?: ProductSort;
}

export type ProductFacetFilters = ProductFilterQueryDto;
export type ProductFilters = ProductListFilterQueryDto;
