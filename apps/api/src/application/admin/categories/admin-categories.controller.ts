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

import {
  AdminCategoriesListResponseDto,
  AdminCategoryDto,
  CreateCategoryDto,
  ListAdminCategoriesQueryDto,
  UpdateCategoryDto,
} from './admin-categories.dto';
import { CategoryNotFoundException } from './admin-categories.exceptions';
import { AdminCategoriesService } from './admin-categories.service';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@ApiExtraModels(AdminCategoryDto, AdminCategoriesListResponseDto)
@UseGuards(AuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    @Inject(AdminCategoriesService) private readonly adminCategoriesService: AdminCategoriesService,
  ) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminCategoriesListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminCategoriesQueryDto): Promise<AdminCategoriesListResponseDto> {
    return await this.adminCategoriesService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminCategoryDto })
  @ApiException(CategoryNotFoundException)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<AdminCategoryDto> {
    return await this.adminCategoriesService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<AdminCategoryDto> {
    return await this.adminCategoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: AdminCategoryDto })
  @ApiException(CategoryNotFoundException)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<AdminCategoryDto> {
    return await this.adminCategoriesService.update(id, dto);
  }
}
