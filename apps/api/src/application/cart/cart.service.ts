import { TransactionalRepository } from '@my-noodles/api-lib/nest';
import { DEFAULT_CURRENCY } from '@my-noodles/utils';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type DataSource, IsNull, Repository } from 'typeorm';

import { type InventoryLine, InventoryService } from '../inventory/inventory.service';
import { Product } from '../products/product.entity';
import type { VisitorSession } from '../visitor/visitor-session.entity';
import { CartItem } from './cart-item.entity';
import type { CartItemDto, CartResponseDto } from './cart.dto';
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

  async getCart(visitor: VisitorSession): Promise<CartResponseDto> {
    const items = await this.loadCartItems(visitor.id);
    const totalMinor = items.reduce((sum, item) => sum + item.priceMinor * item.qty, 0);
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    const currency = items[0]?.currency ?? DEFAULT_CURRENCY;

    return { items, totalMinor, itemCount, currency };
  }

  async addItem(visitor: VisitorSession, productId: string, qty = 1): Promise<CartResponseDto> {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new CartProductNotFoundException(productId);
    }

    await this.withTransaction(async () => {
      const available = await this.inventoryService.getAvailableQty(productId);

      const existing = await this.cartItemsRepository.findOne({
        where: { visitorSessionId: visitor.id, productId, deletedAt: IsNull() },
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

    return this.getCart(visitor);
  }

  async updateItem(visitor: VisitorSession, productId: string, qty: number): Promise<CartResponseDto> {
    const existing = await this.cartItemsRepository.findOne({
      where: { visitorSessionId: visitor.id, productId, deletedAt: IsNull() },
    });

    if (!existing) {
      throw new CartItemNotFoundException(productId);
    }

    await this.withTransaction(async () => {
      const available = await this.inventoryService.getAvailableQty(productId);
      this.assertQtyWithinAvailable(productId, qty, available);
      existing.qty = qty;
      await this.cartItemsRepository.save(existing);
    });

    return this.getCart(visitor);
  }

  async removeItem(visitor: VisitorSession, productId: string): Promise<CartResponseDto> {
    await this.cartItemsRepository.softDelete({
      visitorSessionId: visitor.id,
      productId,
      deletedAt: IsNull(),
    });
    return this.getCart(visitor);
  }

  async clearCart(visitor: VisitorSession): Promise<CartResponseDto> {
    await this.cartItemsRepository.softDelete({ visitorSessionId: visitor.id, deletedAt: IsNull() });
    return this.getCart(visitor);
  }

  async getCartItemsForOrder(visitorSessionId: string): Promise<CartItem[]> {
    return this.cartItemsRepository.find({
      where: { visitorSessionId, deletedAt: IsNull() },
      relations: { product: true },
    });
  }

  async clearCartItems(visitorSessionId: string): Promise<void> {
    await this.cartItemsRepository.softDelete({ visitorSessionId, deletedAt: IsNull() });
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
          where: { visitorSessionId, productId: item.productId, deletedAt: IsNull() },
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
            deletedAt: IsNull(),
          });
          continue;
        }

        await this.cartItemsRepository.update(
          { visitorSessionId, productId: line.productId, deletedAt: IsNull() },
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

  private async loadCartItems(visitorSessionId: string): Promise<CartItemDto[]> {
    const rows = await this.cartItemsRepository.find({
      where: { visitorSessionId, deletedAt: IsNull() },
      relations: { product: true },
      order: { createdAt: 'ASC' },
    });

    return rows.map((row) => ({
      productId: row.productId,
      slug: row.product.slug,
      title: row.product.name.localized ?? '',
      priceMinor: row.product.priceMinor,
      currency: row.product.currency,
      imageUrl: row.product.images[0],
      qty: row.qty,
    }));
  }
}
