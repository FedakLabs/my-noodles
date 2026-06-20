import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { PaginatedMetaDto, PaginationQueryDto } from '@/utils/pagination';
import { parseOptionalBoolean, parseOptionalIntQuery, parseStringArray } from '@/utils/transformers';

import { PRODUCT_SORT_OPTIONS, type ProductSort } from './products.filters';

export class ListProductsQueryDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({ enum: PRODUCT_SORT_OPTIONS })
  @IsOptional()
  @IsIn(PRODUCT_SORT_OPTIONS)
  sort?: ProductSort;
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

  @ApiPropertyOptional({ enum: PRODUCT_SORT_OPTIONS })
  @IsOptional()
  @IsIn(PRODUCT_SORT_OPTIONS)
  sort?: ProductSort;
}

export class BrandRefDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;
}

export class CountryRefDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty({ nullable: true })
  name!: string | null;
}

export class CategoryRefDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  name!: string | null;
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

  @ApiPropertyOptional({ type: BrandRefDto, nullable: true })
  brand!: BrandRefDto | null;

  @ApiProperty({ type: CountryRefDto })
  country!: CountryRefDto;

  @ApiProperty({ type: CategoryRefDto })
  category!: CategoryRefDto;
}

export class PaginatedProductsDto extends PaginatedMetaDto {
  @ApiProperty({ type: [ProductSummaryDto] })
  items!: ProductSummaryDto[];
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
