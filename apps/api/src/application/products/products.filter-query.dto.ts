import {
  TransformToArray,
  TransformToOptionalBoolean,
  TransformToOptionalInt,
} from '@my-noodles/api-lib/transformers';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { PRODUCT_SORT_OPENAPI, type ProductSort } from './products.filters';

/** Intrinsic product dimensions (multi-select) — shared by the catalog and the feed `filters` body. */
export class ProductDimensionFilterQueryDto {
  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  country?: string[];

  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brand?: string[];
}

/** Shared catalog filter query fields — single source for facets + list DTOs. */
export class ProductFilterQueryDto extends ProductDimensionFilterQueryDto {
  @IsOptional()
  @IsString()
  collection?: string;

  @TransformToOptionalInt()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMin?: number;

  @TransformToOptionalInt()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMax?: number;

  @TransformToOptionalBoolean()
  @IsOptional()
  @IsBoolean()
  isTriedByUs?: boolean;

  @TransformToOptionalBoolean()
  @IsOptional()
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
