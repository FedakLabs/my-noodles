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

import { Brand } from '../../brands/brand.entity';
import {
  AdminBrandsListResponseDto,
  CreateBrandDto,
  ListAdminBrandsQueryDto,
  UpdateBrandDto,
} from './admin-brands.dto';
import { BrandNotFoundException } from './admin-brands.exceptions';
import { AdminBrandsService } from './admin-brands.service';

@ApiTags('Admin Brands')
@ApiBearerAuth()
@ApiExtraModels(Brand, AdminBrandsListResponseDto)
@UseGuards(AuthGuard)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(@Inject(AdminBrandsService) private readonly adminBrandsService: AdminBrandsService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminBrandsListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminBrandsQueryDto): Promise<AdminBrandsListResponseDto> {
    return await this.adminBrandsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Brand })
  @ApiException(BrandNotFoundException)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<Brand> {
    return await this.adminBrandsService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateBrandDto): Promise<Brand> {
    return await this.adminBrandsService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Brand })
  @ApiException(BrandNotFoundException)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto): Promise<Brand> {
    return await this.adminBrandsService.update(id, dto);
  }
}
