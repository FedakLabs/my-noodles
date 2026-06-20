import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CollectionDetailDto, CollectionSummaryDto } from './collections.dto';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List active collections' })
  @ApiOkResponse({ type: CollectionSummaryDto, isArray: true })
  list(): Promise<CollectionSummaryDto[]> {
    return this.collectionsService.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get collection by slug' })
  @ApiParam({ name: 'slug', example: 'spicy-snacks' })
  @ApiOkResponse({ type: CollectionDetailDto })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  getBySlug(@Param('slug') slug: string): Promise<CollectionDetailDto> {
    return this.collectionsService.getBySlug(slug);
  }
}
