import { ApiException } from '@my-noodles/api-lib/nest';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentVisitorSession, type VisitorSession } from '../visitor-session';
import { Order } from './order.entity';
import { OrderNotFoundException } from './orders.exceptions';
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
}
