import { ApiException } from '@my-noodles/api-lib/nest';
import { AuthGuard } from '@my-noodles/api-lib/nest/auth';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { Order } from '@/application/orders/order.entity';
import {
  OrderCancelNotAllowedException,
  OrderInventoryChangedException,
  OrderNotFoundException,
} from '@/application/orders/orders.exceptions';

import {
  AdminOrderListMetaDto,
  AdminOrdersListResponseDto,
  CancelOrderDto,
  ListAdminOrdersQueryDto,
} from './admin-orders.dto';
import {
  OrderCreatedDateRangeInvalidException,
  OrderTransitionNotAllowedException,
} from './admin-orders.exceptions';
import { AdminOrdersService } from './admin-orders.service';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@ApiExtraModels(Order, AdminOrdersListResponseDto, AdminOrderListMetaDto)
@UseGuards(AuthGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(@Inject(AdminOrdersService) private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminOrdersListResponseDto) }],
    },
  })
  @ApiException(OrderCreatedDateRangeInvalidException)
  async listOrders(@Query() query: ListAdminOrdersQueryDto): Promise<AdminOrdersListResponseDto> {
    return await this.adminOrdersService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException)
  async getOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.getById(id);
  }

  @Post(':id/confirm')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderTransitionNotAllowedException)
  async confirmOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.confirm(id);
  }

  @Post(':id/send')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderTransitionNotAllowedException)
  async sendOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.send(id);
  }

  @Post(':id/arrive')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderTransitionNotAllowedException)
  async arriveOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.arrive(id);
  }

  @Post(':id/complete')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderTransitionNotAllowedException)
  async completeOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.complete(id);
  }

  @Post(':id/cancel')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderCancelNotAllowedException, OrderInventoryChangedException)
  async cancelOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelOrderDto): Promise<Order> {
    return await this.adminOrdersService.cancel(id, dto.cancelledReason);
  }

  @Post(':id/return')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderTransitionNotAllowedException)
  async returnOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.returnOrder(id);
  }

  @Post(':id/archive')
  @ApiOkResponse({ type: Order })
  @ApiException(OrderNotFoundException, OrderTransitionNotAllowedException)
  async archiveOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.adminOrdersService.archive(id);
  }
}
