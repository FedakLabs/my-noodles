import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocaleQueryDto } from '@/utils/locale-query';

import {
  ListProductsQueryDto,
  PaginatedProductsDto,
  ProductDetailDto,
  ProductFacetsQueryDto,
  ProductFacetsResponseDto,
} from './products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get('facets')
  @ApiOperation({ summary: 'Catalog facet options and result counts for the current filter state' })
  getFacets(@Query() query: ProductFacetsQueryDto): Promise<ProductFacetsResponseDto> {
    return this.productsService.getFacets(query);
  }

  @Get()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  list(@Query() query: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.list(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getBySlug(@Param('slug') slug: string, @Query() _query: LocaleQueryDto): Promise<ProductDetailDto> {
    return this.productsService.getBySlug(slug);
  }
}
