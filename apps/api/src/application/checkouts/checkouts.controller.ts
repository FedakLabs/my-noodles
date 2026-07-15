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
  Req,
  Res,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { CartEmptyException, CartInventoryChangedException } from '../cart/cart.exceptions';
import { OrderResponseDto } from '../orders/orders.dto';
import { OrderInventoryChangedException } from '../orders/orders.exceptions';
import { readVisitorSessionId, VisitorSessionService, writeVisitorSessionCookie } from '../visitor';
import {
  CheckoutDetailDto,
  CheckoutsListDto,
  CheckoutStartDto,
  ListCheckoutsQueryDto,
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
} from './checkouts.dto';
import {
  CheckoutExpiredException,
  CheckoutNotFoundException,
  CheckoutNotInProgressException,
} from './checkouts.exceptions';
import { CheckoutsService } from './checkouts.service';

@ApiTags('Checkouts')
@Controller('checkouts')
export class CheckoutsController {
  constructor(
    @Inject(CheckoutsService) private readonly checkoutsService: CheckoutsService,
    @Inject(VisitorSessionService) private readonly visitorService: VisitorSessionService,
  ) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Begin checkout — move cart items into a draft order or an active in-progress checkout',
  })
  @ApiCreatedResponse({ type: CheckoutStartDto })
  @ApiException(CartEmptyException, CartInventoryChangedException)
  async startCheckout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CheckoutStartDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.startFromCart(visitor.id);
  }

  @Get()
  @ApiOperation({ summary: 'List checkouts for the current visitor session' })
  @ApiOkResponse({ type: CheckoutsListDto })
  async listCheckouts(
    @Query() query: ListCheckoutsQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CheckoutsListDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.listCheckouts(visitor.id, query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get checkout details' })
  @ApiOkResponse({ type: CheckoutDetailDto })
  @ApiException(CheckoutNotFoundException, CheckoutNotInProgressException, CheckoutExpiredException)
  async getCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CheckoutDetailDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.getCheckout(id, visitor.id);
  }

  @Patch(':id/receiver')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Autosave checkout receiver fields on blur' })
  @ApiOkResponse({ type: CheckoutDetailDto })
  @ApiException(CheckoutNotFoundException, CheckoutNotInProgressException, CheckoutExpiredException)
  async updateCheckoutReceiver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCheckoutReceiverDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CheckoutDetailDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.updateCheckoutReceiver(id, visitor.id, dto);
  }

  @Patch(':id/delivery')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Autosave checkout delivery fields on change' })
  @ApiOkResponse({ type: CheckoutDetailDto })
  @ApiException(CheckoutNotFoundException, CheckoutNotInProgressException, CheckoutExpiredException)
  async updateCheckoutDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCheckoutDeliveryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CheckoutDetailDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.updateCheckoutDelivery(id, visitor.id, dto);
  }

  @Post(':id/submit')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit checkout — place order' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiException(
    CheckoutNotFoundException,
    CheckoutNotInProgressException,
    CheckoutExpiredException,
    OrderInventoryChangedException,
  )
  async submitCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitCheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OrderResponseDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.submitCheckout(id, visitor.id, dto);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Cancel checkout' })
  @ApiOkResponse({ type: CheckoutDetailDto })
  @ApiException(CheckoutNotFoundException, CheckoutNotInProgressException)
  async cancelCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CheckoutDetailDto> {
    const visitor = await this.resolveVisitor(req, res);
    return this.checkoutsService.cancelCheckout(id, visitor.id);
  }

  private async resolveVisitor(req: Request, res: Response) {
    const visitor = await this.visitorService.resolve(readVisitorSessionId(req));
    writeVisitorSessionCookie(res, visitor.id);
    return visitor;
  }
}
