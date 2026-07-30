import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { ListCollectionsQueryDto, PaginatedCollectionsDto } from './collections.dto';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController extends LocalizedStorefrontController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {
    super();
  }

  @Get()
  list(@Query() query: ListCollectionsQueryDto): Promise<PaginatedCollectionsDto> {
    return this.collectionsService.list(query);
  }
}
