import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  DeliveryCityDto,
  DeliveryCityQueryDto,
  DeliveryProviderDto,
  DeliveryWarehouseDto,
  DeliveryWarehouseQueryDto,
} from './delivery.dto';
import { DeliveryService } from './delivery.service';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(@Inject(DeliveryService) private readonly deliveryService: DeliveryService) {}

  @Get('providers')
  listProviders(): DeliveryProviderDto[] {
    return this.deliveryService.listProviders();
  }

  @Get('cities')
  searchCities(@Query() query: DeliveryCityQueryDto): Promise<DeliveryCityDto[]> {
    return this.deliveryService.searchCities(query.provider, query.q, query.method);
  }

  @Get('warehouses')
  searchWarehouses(@Query() query: DeliveryWarehouseQueryDto): Promise<DeliveryWarehouseDto[]> {
    return this.deliveryService.searchWarehouses(query.provider, query.cityRef, query.q);
  }
}
