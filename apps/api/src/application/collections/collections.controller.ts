import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { CollectionDetailDto, CollectionSummaryDto } from './collections.dto';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController extends LocalizedStorefrontController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'List active collections' })
  list(): Promise<CollectionSummaryDto[]> {
    return this.collectionsService.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get collection by slug' })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  getBySlug(@Param('slug') slug: string): Promise<CollectionDetailDto> {
    return this.collectionsService.getBySlug(slug);
  }
}
