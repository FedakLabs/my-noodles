import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { Collection } from './collection.entity';
import { CollectionsService } from './collections.service';

class ListCollectionsQueryDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController extends LocalizedStorefrontController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {
    super();
  }

  @Get()
  list(@Query() query: ListCollectionsQueryDto): Promise<Collection[]> {
    return this.collectionsService.list(query.limit);
  }

  @Get(':slug')
  @ApiNotFoundResponse({ description: 'Collection not found' })
  getBySlug(@Param('slug') slug: string): Promise<Collection> {
    return this.collectionsService.getBySlug(slug);
  }
}
