import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { PaginatedMetaSwaggerDto, PaginationQuerySwaggerDto } from '@/utils/swagger';

import { Product } from './product.entity';
import { ProductFilterQueryDto, ProductListFilterQueryDto } from './products.filter-query.dto';

export type { ProductFacetFilters, ProductFilters } from './products.filter-query.dto';

export class ListProductsQueryDto extends IntersectionType(
  PaginationQuerySwaggerDto,
  ProductListFilterQueryDto,
) {}

export { ProductFilterQueryDto as ProductFacetsQueryDto };

export class PaginatedProductsDto extends PaginatedMetaSwaggerDto {
  @ApiProperty({ type: [Product] })
  items!: Product[];
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

  seller!: ProductFacetOptionDto[];

  price!: PriceFacetDto;

  isTriedByUs!: number;

  inStock!: number;
}

export class ProductFacetsResponseDto {
  total!: number;

  facets!: ProductFacetsDto;
}
