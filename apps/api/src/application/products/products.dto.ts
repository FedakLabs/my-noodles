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

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
}

export class CategoryRefDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;
}

export class ProductSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
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
  @ApiPropertyOptional({ type: String, nullable: true })
  weight!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true })
  story!: string | null;

  @ApiProperty({ type: String, nullable: true })
  forWhom!: string | null;

  @ApiProperty({ type: ProductFlavorDto })
  flavor!: ProductFlavorDto;

  @ApiProperty({ type: [String] })
  allergens!: string[];

  @ApiProperty({ type: [ProductSummaryDto] })
  alternatives!: ProductSummaryDto[];
}

export class ProductFacetOptionDto {
  @ApiProperty()
  value!: string;

  @ApiProperty({ type: String, nullable: true })
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
  @ApiProperty({ type: [ProductFacetOptionDto] })
  category!: ProductFacetOptionDto[];

  @ApiProperty({ type: [ProductFacetOptionDto] })
  country!: ProductFacetOptionDto[];

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
