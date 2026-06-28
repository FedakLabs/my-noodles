import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

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
export class ProductsController extends LocalizedStorefrontController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {
    super();
  }

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
  getBySlug(@Param('slug') slug: string): Promise<ProductDetailDto> {
    return this.productsService.getBySlug(slug);
  }
}
