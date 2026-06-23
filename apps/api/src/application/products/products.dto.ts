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
  slug!: string;

  name!: string;
}

export class CountryRefDto {
  slug!: string;

  code!: string;

  name!: string | null;
}

export class CategoryRefDto {
  slug!: string;

  name!: string | null;
}

export class ProductSummaryDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  slug!: string;

  name!: string | null;

  priceMinor!: number;

  currency!: string;

  images!: string[];

  inStock!: boolean;

  isTriedByUs!: boolean;

  sortWeight!: number;

  @ApiPropertyOptional({ type: () => BrandRefDto, nullable: true })
  brand!: BrandRefDto | null;

  country!: CountryRefDto;

  category!: CategoryRefDto;
}

export class PaginatedProductsDto extends PaginatedMetaDto {
  items!: ProductSummaryDto[];
}

export class ProductFlavorDto {
  spice!: number;

  sweet!: number;

  texture!: string;
}

export class ProductDetailDto extends ProductSummaryDto {
  weight!: string | null;

  description!: string | null;

  story!: string | null;

  forWhom!: string | null;

  flavor!: ProductFlavorDto;

  allergens!: string[];

  videos!: string[];

  alternatives!: ProductSummaryDto[];
}

export class ProductFacetOptionDto {
  value!: string;

  label!: string | null;

  count!: number;
}

export class PriceFacetDto {
  min!: number;

  max!: number;
}

export class ProductFacetsDto {
  category!: ProductFacetOptionDto[];

  country!: ProductFacetOptionDto[];

  brand!: ProductFacetOptionDto[];

  price!: PriceFacetDto;

  isTriedByUs!: number;

  inStock!: number;
}

export class ProductFacetsResponseDto {
  total!: number;

  facets!: ProductFacetsDto;
}
