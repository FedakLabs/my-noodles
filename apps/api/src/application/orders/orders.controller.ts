import { ApiException } from '@my-noodles/api-lib/nest';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentVisitorSession, type VisitorSession } from '../visitor-session';
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

  @Get(':id')
  @ApiException(OrderNotFoundException)
  async getOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Order> {
    return await this.ordersService.getForVisitor(id, visitor.id);
  }

  @Post(':id/cancel')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiException(OrderNotFoundException, OrderCancelNotAllowedException, OrderInventoryChangedException)
  async cancelOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelOrderDto): Promise<Order> {
    return await this.ordersService.cancelSubmittedOrder(id, dto.reason);
  }
}
