import { TransactionalRepository } from '@my-noodles/api-lib/nest';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type DataSource, type FindOptionsOrder, type FindOptionsWhere, In, Repository } from 'typeorm';

import { type InventoryLine, InventoryService } from '../inventory/inventory.service';
import { Product } from '../products/product.entity';
import type { VisitorSession } from '../visitor-session/visitor-session.entity';
import { Cart } from './cart';
import { CartItem } from './cart-item.entity';
import type { AddCartItemDto, CartResponseDto } from './cart.dto';
import {
  CartItemNotFoundException,
  CartMaxQuantityReachedException,
  CartProductNotFoundException,
  CartProductOutOfStockException,
} from './cart.exceptions';

@Injectable()
export class CartService extends TransactionalRepository {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService,
  ) {
    super(dataSource);
  }

  async get(visitorSessionId: string): Promise<Cart> {
    const items = await this.getCartItems({ visitorSessionId }, { createdAt: 'ASC' });
    return Cart.fromItems(visitorSessionId, items);
  }

  async getCart(visitor: VisitorSession): Promise<CartResponseDto> {
    return this.toResponseDto(await this.get(visitor.id));
  }

  getCartItems(where: FindOptionsWhere<CartItem>, order?: FindOptionsOrder<CartItem>): Promise<CartItem[]> {
    return this.cartItemsRepository.find({ where, order });
  }

  private toResponseDto(cart: Cart): CartResponseDto {
    return {
      items: cart.items,
      totalMinor: cart.totalMinor,
      itemCount: cart.itemCount,
      currency: cart.currency,
    };
  }

  async addItem(visitor: VisitorSession, productId: string, qty = 1): Promise<CartResponseDto> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new CartProductNotFoundException(productId);
    }

    await this.withTransaction(async () => {
      const available = await this.inventoryService.getAvailableQty(productId);

      const existing = await this.cartItemsRepository.findOne({
        where: { visitorSessionId: visitor.id, productId },
      });

      const nextQty = (existing?.qty ?? 0) + qty;
      this.assertQtyWithinAvailable(productId, nextQty, available);

      if (existing) {
        existing.qty = nextQty;
        await this.cartItemsRepository.save(existing);
      } else {
        await this.cartItemsRepository.save(
          this.cartItemsRepository.create({ visitorSessionId: visitor.id, productId, qty: nextQty }),
        );
      }
    });

    return await this.getCart(visitor);
  }

  async addItemsBatch(visitor: VisitorSession, items: AddCartItemDto[]): Promise<CartResponseDto> {
    const merged = this.mergeBatchItems(items);
    const productIds = merged.map((item) => item.productId);

    const products = await this.productsRepository.find({ where: { id: In(productIds) } });
    const foundIds = new Set(products.map((product) => product.id));
    for (const productId of productIds) {
      if (!foundIds.has(productId)) {
        throw new CartProductNotFoundException(productId);
      }
    }

    await this.withTransaction(async () => {
      const availableByProductId = await this.inventoryService.getAvailableQtyBatch(productIds);
      const existingItems = await this.cartItemsRepository.find({
        where: { visitorSessionId: visitor.id, productId: In(productIds) },
      });
      const existingByProductId = new Map(existingItems.map((item) => [item.productId, item]));

      const nextByProductId = new Map<
        string,
        { existing?: (typeof existingItems)[number]; nextQty: number }
      >();
      for (const item of merged) {
        const existing = existingByProductId.get(item.productId);
        const nextQty = (existing?.qty ?? 0) + item.qty;
        this.assertQtyWithinAvailable(item.productId, nextQty, availableByProductId.get(item.productId) ?? 0);
        nextByProductId.set(item.productId, { existing, nextQty });
      }

      for (const [productId, { existing, nextQty }] of nextByProductId) {
        if (existing) {
          existing.qty = nextQty;
          await this.cartItemsRepository.save(existing);
        } else {
          await this.cartItemsRepository.save(
            this.cartItemsRepository.create({
              visitorSessionId: visitor.id,
              productId,
              qty: nextQty,
            }),
          );
        }
      }
    });

    return await this.getCart(visitor);
  }

  private mergeBatchItems(items: AddCartItemDto[]): Array<{ productId: string; qty: number }> {
    const qtyByProductId = new Map<string, number>();
    for (const item of items) {
      const qty = item.qty ?? 1;
      qtyByProductId.set(item.productId, (qtyByProductId.get(item.productId) ?? 0) + qty);
    }
    return [...qtyByProductId.entries()].map(([productId, qty]) => ({ productId, qty }));
  }

  async updateItem(visitor: VisitorSession, productId: string, qty: number): Promise<CartResponseDto> {
    const existing = await this.cartItemsRepository.findOne({
      where: { visitorSessionId: visitor.id, productId },
    });

    if (!existing) {
      throw new CartItemNotFoundException(productId);
    }

    if (qty <= 0) {
      return await this.removeItem(visitor, productId);
    }

    await this.withTransaction(async () => {
      const available = await this.inventoryService.getAvailableQty(productId);
      this.assertQtyWithinAvailable(productId, qty, available);
      existing.qty = qty;
      await this.cartItemsRepository.save(existing);
    });

    return await this.getCart(visitor);
  }

  async removeItem(visitor: VisitorSession, productId: string): Promise<CartResponseDto> {
    await this.cartItemsRepository.softDelete({
      visitorSessionId: visitor.id,
      productId,
    });
    return await this.getCart(visitor);
  }

  async clearCart(visitor: VisitorSession): Promise<CartResponseDto> {
    await this.cartItemsRepository.softDelete({ visitorSessionId: visitor.id });
    return await this.getCart(visitor);
  }

  async clearCartItems(visitorSessionId: string): Promise<void> {
    await this.cartItemsRepository.softDelete({ visitorSessionId });
  }

  async restoreItemsFromOrder(
    visitorSessionId: string,
    items: Array<{ productId: string; qty: number }>,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }

    await this.withTransaction(async () => {
      for (const item of items) {
        if (item.qty <= 0) {
          continue;
        }

        const existing = await this.cartItemsRepository.findOne({
          where: { visitorSessionId, productId: item.productId },
        });

        if (existing) {
          existing.qty += item.qty;
          await this.cartItemsRepository.save(existing);
          continue;
        }

        await this.cartItemsRepository.save(
          this.cartItemsRepository.create({
            visitorSessionId,
            productId: item.productId,
            qty: item.qty,
          }),
        );
      }
    });
  }

  async applyReconciledQuantities(visitorSessionId: string, lines: InventoryLine[]): Promise<void> {
    await this.withTransaction(async () => {
      for (const line of lines) {
        if (line.qty <= 0) {
          await this.cartItemsRepository.softDelete({
            visitorSessionId,
            productId: line.productId,
          });
          continue;
        }

        await this.cartItemsRepository.update(
          { visitorSessionId, productId: line.productId },
          { qty: line.qty },
        );
      }
    });
  }

  private assertQtyWithinAvailable(productId: string, qty: number, available: number): void {
    if (available <= 0) {
      throw new CartProductOutOfStockException(productId);
    }

    if (qty > available) {
      throw new CartMaxQuantityReachedException(productId, available);
    }
  }
}
