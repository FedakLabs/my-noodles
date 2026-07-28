import { ApiException } from '@my-noodles/api-lib/nest';
import { AuthGuard } from '@my-noodles/api-lib/nest/auth';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { Product } from '../../products/product.entity';
import {
  AdminProductsListResponseDto,
  CreateProductDto,
  ListAdminProductsQueryDto,
  UpdateProductDto,
} from './admin-products.dto';
import {
  AdminProductNotFoundException,
  ProductBrandNotFoundException,
  ProductCategoryNotFoundException,
  ProductCountryNotFoundException,
  ProductSellerNotFoundException,
} from './admin-products.exceptions';
import { AdminProductsService } from './admin-products.service';

@ApiTags('Admin Products')
@ApiBearerAuth()
@ApiExtraModels(Product, AdminProductsListResponseDto)
@UseGuards(AuthGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(@Inject(AdminProductsService) private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminProductsListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminProductsQueryDto): Promise<AdminProductsListResponseDto> {
    return await this.adminProductsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Product })
  @ApiException(AdminProductNotFoundException)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return await this.adminProductsService.getById(id);
  }

  @Post()
  @ApiException(
    ProductBrandNotFoundException,
    ProductCategoryNotFoundException,
    ProductCountryNotFoundException,
    ProductSellerNotFoundException,
  )
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return await this.adminProductsService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Product })
  @ApiException(
    AdminProductNotFoundException,
    ProductBrandNotFoundException,
    ProductCategoryNotFoundException,
    ProductCountryNotFoundException,
    ProductSellerNotFoundException,
  )
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return await this.adminProductsService.update(id, dto);
  }
}
