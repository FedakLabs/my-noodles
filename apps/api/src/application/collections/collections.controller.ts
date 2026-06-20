import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import type { CollectionDetailDto, CollectionSummaryDto } from './collections.dto';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List active collections' })
  list(): Promise<CollectionSummaryDto[]> {
    return this.collectionsService.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get collection by slug' })
  getBySlug(@Param('slug') slug: string): Promise<CollectionDetailDto> {
    return this.collectionsService.getBySlug(slug);
  }
}
