import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { Collection } from './collection.entity';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController extends LocalizedStorefrontController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {
    super();
  }

  @Get()
  list(): Promise<Collection[]> {
    return this.collectionsService.list();
  }

  @Get(':slug')
  @ApiNotFoundResponse({ description: 'Collection not found' })
  getBySlug(@Param('slug') slug: string): Promise<Collection> {
    return this.collectionsService.getBySlug(slug);
  }
}
