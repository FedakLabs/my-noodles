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

import { Collection } from '../../collections/collection.entity';
import {
  AdminCollectionsListResponseDto,
  CreateCollectionDto,
  ListAdminCollectionsQueryDto,
  UpdateCollectionDto,
} from './admin-collections.dto';
import { CollectionNotFoundException } from './admin-collections.exceptions';
import { AdminCollectionsService } from './admin-collections.service';

@ApiTags('Admin Collections')
@ApiBearerAuth()
@ApiExtraModels(Collection, AdminCollectionsListResponseDto)
@UseGuards(AuthGuard)
@Controller('admin/collections')
export class AdminCollectionsController {
  constructor(
    @Inject(AdminCollectionsService) private readonly adminCollectionsService: AdminCollectionsService,
  ) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminCollectionsListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminCollectionsQueryDto): Promise<AdminCollectionsListResponseDto> {
    return await this.adminCollectionsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Collection })
  @ApiException(CollectionNotFoundException)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<Collection> {
    return await this.adminCollectionsService.getById(id);
  }

  @Post()
  @ApiOkResponse({ type: Collection })
  async create(@Body() dto: CreateCollectionDto): Promise<Collection> {
    return await this.adminCollectionsService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Collection })
  @ApiException(CollectionNotFoundException)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
  ): Promise<Collection> {
    return await this.adminCollectionsService.update(id, dto);
  }
}
