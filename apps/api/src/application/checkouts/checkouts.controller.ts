import { ApiException } from '@my-noodles/api-lib/nest';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CartEmptyException, CartInventoryChangedException } from '../cart/cart.exceptions';
import { Order } from '../orders/order.entity';
import { OrderInventoryChangedException } from '../orders/orders.exceptions';
import { CurrentVisitorSession, type VisitorSession } from '../visitor-session';
import { Checkout } from './checkout.entity';
import {
  CancelCheckoutDto,
  ListCheckoutsQueryDto,
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
} from './checkouts.dto';
import { CheckoutInactiveException, CheckoutNotFoundException } from './checkouts.exceptions';
import { CheckoutsService } from './checkouts.service';

@ApiTags('Checkouts')
@Controller('checkouts')
export class CheckoutsController {
  constructor(@Inject(CheckoutsService) private readonly checkoutsService: CheckoutsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiException(CartEmptyException, CartInventoryChangedException)
  async startCheckout(@CurrentVisitorSession() visitor: VisitorSession): Promise<Checkout> {
    return await this.checkoutsService.startFromCart(visitor.id);
  }

  @Get()
  async listCheckouts(
    @Query() query: ListCheckoutsQueryDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Checkout[]> {
    return await this.checkoutsService.listCheckouts(visitor.id, query.status);
  }

  @Get(':id')
  @ApiException(CheckoutNotFoundException)
  async getCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Checkout> {
    return await this.checkoutsService.get({ id, visitorSessionId: visitor.id });
  }

  @Patch(':id/receiver')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiException(CheckoutNotFoundException, CheckoutInactiveException)
  async updateCheckoutReceiver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCheckoutReceiverDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Checkout> {
    return await this.checkoutsService.updateCheckoutReceiver(id, visitor.id, dto);
  }

  @Patch(':id/delivery')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiException(CheckoutNotFoundException, CheckoutInactiveException)
  async updateCheckoutDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCheckoutDeliveryDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Checkout> {
    return await this.checkoutsService.updateCheckoutDelivery(id, visitor.id, dto);
  }

  @Post(':id/submit')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiException(CheckoutNotFoundException, CheckoutInactiveException, OrderInventoryChangedException)
  async submitCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitCheckoutDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Order> {
    return await this.checkoutsService.submitCheckout(id, visitor.id, dto);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiException(CheckoutNotFoundException, CheckoutInactiveException)
  async cancelCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelCheckoutDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<Checkout> {
    return await this.checkoutsService.cancelCheckout(id, visitor.id, dto.reason);
  }
}
