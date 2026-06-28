import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  DeliveryCityDto,
  DeliveryCityQueryDto,
  DeliveryProviderDto,
  DeliveryWarehouseDto,
  DeliveryWarehouseQueryDto,
} from './delivery.dto';
import { DeliveryService } from './delivery.service';
import type { DeliveryCity, DeliveryWarehouse } from './delivery.types';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(@Inject(DeliveryService) private readonly deliveryService: DeliveryService) {}

  @Get('providers')
  @ApiOperation({ summary: 'List available delivery providers' })
  listProviders(): DeliveryProviderDto[] {
    return this.deliveryService.listProviders();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Search cities for a delivery provider' })
  @ApiOkResponse({ type: [DeliveryCityDto] })
  searchCities(@Query() query: DeliveryCityQueryDto): Promise<DeliveryCity[]> {
    return this.deliveryService.searchCities(query.provider, query.q);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Search warehouses for a city and delivery provider' })
  @ApiOkResponse({ type: [DeliveryWarehouseDto] })
  searchWarehouses(@Query() query: DeliveryWarehouseQueryDto): Promise<DeliveryWarehouse[]> {
    return this.deliveryService.searchWarehouses(query.provider, query.cityRef, query.q);
  }
}
