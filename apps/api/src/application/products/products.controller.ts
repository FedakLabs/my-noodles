import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Product facet counts for catalog filters' })
  @ApiOkResponse({ type: ProductFacetsResponseDto })
  getFacets(@Query() query: ProductFacetsQueryDto): Promise<ProductFacetsResponseDto> {
    return this.productsService.getFacets(query);
  }

  @Get()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  @ApiOkResponse({ type: PaginatedProductsDto })
  list(@Query() query: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.list(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', example: 'pocky-matcha' })
  @ApiOkResponse({ type: ProductDetailDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getBySlug(@Param('slug') slug: string, @Query() _query: LocaleQueryDto): Promise<ProductDetailDto> {
    return this.productsService.getBySlug(slug);
  }
}
