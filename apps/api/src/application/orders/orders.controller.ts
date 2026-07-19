import { ApiException } from '@my-noodles/api-lib/nest';
import { Body, Controller, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Order } from './order.entity';
import { CancelOrderDto } from './orders.dto';
import {
  OrderCancelNotAllowedException,
  OrderInventoryChangedException,
  OrderNotFoundException,
} from './orders.exceptions';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post(':id/cancel')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiException(OrderNotFoundException, OrderCancelNotAllowedException, OrderInventoryChangedException)
  async cancelOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelOrderDto): Promise<Order> {
    return await this.ordersService.cancelSubmittedOrder(id, dto.reason);
  }
}
