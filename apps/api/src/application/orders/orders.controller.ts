import { ApiException } from '@my-noodles/api-lib/nest';
import { Body, Controller, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CancelOrderDto, OrderResponseDto } from './orders.dto';
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
  @ApiOperation({ summary: 'Manager cancel — restore stock on submitted orders (new+)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiException(OrderNotFoundException, OrderCancelNotAllowedException, OrderInventoryChangedException)
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancelSubmittedOrder(id, dto.reason);
  }
}
