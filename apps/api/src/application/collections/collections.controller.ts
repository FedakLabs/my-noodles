import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { LocaleQueryDto } from '@/utils/locale-query';

import { CollectionDetailDto, CollectionSummaryDto } from './collections.dto';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List active collections' })
  @ApiOkResponse({ type: CollectionSummaryDto, isArray: true })
  list(@Query() _query: LocaleQueryDto): Promise<CollectionSummaryDto[]> {
    return this.collectionsService.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get collection by slug' })
  @ApiParam({ name: 'slug', example: 'spicy-snacks' })
  @ApiOkResponse({ type: CollectionDetailDto })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  getBySlug(@Param('slug') slug: string, @Query() _query: LocaleQueryDto): Promise<CollectionDetailDto> {
    return this.collectionsService.getBySlug(slug);
  }
}
