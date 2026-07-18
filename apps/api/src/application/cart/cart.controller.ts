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
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { readVisitorSessionId, VisitorSessionService, writeVisitorSessionCookie } from '../visitor';
import { AddCartItemDto, CartResponseDto, SetCartItemQtyDto } from './cart.dto';
import {
  CartItemNotFoundException,
  CartMaxQuantityReachedException,
  CartProductNotFoundException,
  CartProductOutOfStockException,
} from './cart.exceptions';
import { CartService } from './cart.service';

@ApiTags('Cart')
@Controller('cart')
export class CartController extends LocalizedStorefrontController {
  constructor(
    @Inject(VisitorSessionService) private readonly visitorService: VisitorSessionService,
    @Inject(CartService) private readonly cartService: CartService,
  ) {
    super();
  }

  @Get()
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<CartResponseDto> {
    const visitor = await this.resolveVisitorForCart(req, res);
    return this.cartService.getCart(visitor);
  }

  @Post('items')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiException(CartProductNotFoundException, CartProductOutOfStockException, CartMaxQuantityReachedException)
  async addItem(
    @Body() dto: AddCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponseDto> {
    const visitor = await this.resolveVisitorForCart(req, res);
    return this.cartService.addItem(visitor, dto.productId, dto.qty ?? 1);
  }

  @Patch('items/:productId')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiException(CartItemNotFoundException, CartProductOutOfStockException, CartMaxQuantityReachedException)
  async setItemQty(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetCartItemQtyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponseDto> {
    const visitor = await this.resolveVisitorForCart(req, res);
    return this.cartService.updateItem(visitor, productId, dto.qty);
  }

  @Delete('items/:productId')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async removeItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartResponseDto> {
    const visitor = await this.resolveVisitorForCart(req, res);
    return this.cartService.removeItem(visitor, productId);
  }

  @Delete()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async clearCart(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<CartResponseDto> {
    const visitor = await this.resolveVisitorForCart(req, res);
    return this.cartService.clearCart(visitor);
  }

  private async resolveVisitorForCart(req: Request, res: Response) {
    const visitor = await this.visitorService.resolve(readVisitorSessionId(req));
    const refreshed = await this.visitorService.resolveForCart(visitor);
    writeVisitorSessionCookie(res, refreshed.id);
    return refreshed;
  }
}
