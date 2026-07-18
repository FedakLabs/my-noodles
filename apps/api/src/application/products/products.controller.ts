import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { Product } from './product.entity';
import {
  ListProductsQueryDto,
  PaginatedProductsDto,
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
  getFacets(@Query() query: ProductFacetsQueryDto): Promise<ProductFacetsResponseDto> {
    return this.productsService.getFacets(query);
  }

  @Get()
  list(@Query() query: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.list(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.getBySlug(slug);
  }
}
