import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import { LocaleQueryDto } from '@/utils/locale-query';
import { PaginatedMetaDto, PaginationQueryDto } from '@/utils/pagination';

import { ProductFilterQueryDto, ProductListFilterQueryDto } from './products.filter-query.dto';

export type { ProductFacetFilters, ProductFilters } from './products.filter-query.dto';

export class ListProductsQueryDto extends IntersectionType(
  PaginationQueryDto,
  ProductListFilterQueryDto,
  LocaleQueryDto,
) {}

export class ProductFacetsQueryDto extends IntersectionType(ProductFilterQueryDto, LocaleQueryDto) {}

export class BrandRefDto {
  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String })
  name!: string;
}

export class CountryRefDto {
  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String })
  code!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
}

export class CategoryRefDto {
  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
}

export class ProductSummaryDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiProperty({ type: Number })
  priceMinor!: number;

  @ApiProperty({ type: String })
  currency!: string;

  @ApiProperty({ type: [String] })
  images!: string[];

  @ApiProperty({ type: Boolean })
  inStock!: boolean;

  @ApiProperty({ type: Boolean })
  isTriedByUs!: boolean;

  @ApiProperty({ type: Number })
  sortWeight!: number;

  @ApiPropertyOptional({ type: () => BrandRefDto, nullable: true })
  brand!: BrandRefDto | null;

  @ApiProperty({ type: () => CountryRefDto })
  country!: CountryRefDto;

  @ApiProperty({ type: () => CategoryRefDto })
  category!: CategoryRefDto;
}

export class PaginatedProductsDto extends PaginatedMetaDto {
  @ApiProperty({ type: () => [ProductSummaryDto] })
  items!: ProductSummaryDto[];
}

export class ProductFlavorDto {
  @ApiProperty({ type: Number })
  spice!: number;

  @ApiProperty({ type: Number })
  sweet!: number;

  @ApiProperty({ type: String })
  texture!: string;
}

export class ProductDetailDto extends ProductSummaryDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  weight!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true })
  story!: string | null;

  @ApiProperty({ type: String, nullable: true })
  forWhom!: string | null;

  @ApiProperty({ type: () => ProductFlavorDto })
  flavor!: ProductFlavorDto;

  @ApiProperty({ type: [String] })
  allergens!: string[];

  @ApiProperty({ type: () => [ProductSummaryDto] })
  alternatives!: ProductSummaryDto[];
}

export class ProductFacetOptionDto {
  @ApiProperty({ type: String })
  value!: string;

  @ApiProperty({ type: String, nullable: true })
  label!: string | null;

  @ApiProperty({ type: Number })
  count!: number;
}

export class PriceFacetDto {
  @ApiProperty({ type: Number })
  min!: number;

  @ApiProperty({ type: Number })
  max!: number;
}

export class ProductFacetsDto {
  @ApiProperty({ type: [ProductFacetOptionDto] })
  category!: ProductFacetOptionDto[];

  @ApiProperty({ type: [ProductFacetOptionDto] })
  country!: ProductFacetOptionDto[];

  @ApiProperty({ type: () => PriceFacetDto })
  price!: PriceFacetDto;

  @ApiProperty({ type: Number })
  isTriedByUs!: number;

  @ApiProperty({ type: Number })
  inStock!: number;
}

export class ProductFacetsResponseDto {
  @ApiProperty({ type: Number })
  total!: number;

  @ApiProperty({ type: () => ProductFacetsDto })
  facets!: ProductFacetsDto;
}
