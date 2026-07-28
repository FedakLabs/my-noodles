import { ApiException } from '@my-noodles/api-lib/nest';
import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { CurrentVisitorSession, type VisitorSession, VisitorSessionService } from '../visitor-session';
import { AddCartItemDto, AddCartItemsBatchDto, CartResponseDto, SetCartItemQtyDto } from './cart.dto';
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
  async getCart(@CurrentVisitorSession() visitor: VisitorSession): Promise<CartResponseDto> {
    return await this.cartService.getCart(await this.visitorService.resolveForCart(visitor));
  }

  @Post('items')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiException(CartProductNotFoundException, CartProductOutOfStockException, CartMaxQuantityReachedException)
  async addItem(
    @Body() dto: AddCartItemDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<CartResponseDto> {
    return await this.cartService.addItem(
      await this.visitorService.resolveForCart(visitor),
      dto.productId,
      dto.qty ?? 1,
    );
  }

  @Post('items/batch')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiException(CartProductNotFoundException, CartProductOutOfStockException, CartMaxQuantityReachedException)
  async addItemsBatch(
    @Body() dto: AddCartItemsBatchDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<CartResponseDto> {
    return await this.cartService.addItemsBatch(await this.visitorService.resolveForCart(visitor), dto.items);
  }

  @Patch('items/:productId')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiException(CartItemNotFoundException, CartProductOutOfStockException, CartMaxQuantityReachedException)
  async setItemQty(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SetCartItemQtyDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<CartResponseDto> {
    return await this.cartService.updateItem(
      await this.visitorService.resolveForCart(visitor),
      productId,
      dto.qty,
    );
  }

  @Delete('items/:productId')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async removeItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<CartResponseDto> {
    return await this.cartService.removeItem(await this.visitorService.resolveForCart(visitor), productId);
  }

  @Delete()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async clearCart(@CurrentVisitorSession() visitor: VisitorSession): Promise<CartResponseDto> {
    return await this.cartService.clearCart(await this.visitorService.resolveForCart(visitor));
  }
}
