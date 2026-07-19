import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, type Repository } from 'typeorm';

import { CheckoutStatus } from '../checkouts/checkouts.validators';
import { OrderItem } from '../orders/order-item.entity';
import { OrderInventoryChangedException } from '../orders/orders.exceptions';
import { Product } from '../products/product.entity';

export type InventoryLine = {
  productId: string;
  qty: number;
};

function groupSumBy<T>(
  rows: T[],
  keyFn: (row: T) => string,
  valueFn: (row: T) => number,
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const key = keyFn(row);
    totals.set(key, (totals.get(key) ?? 0) + valueFn(row));
  }

  return totals;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  async getAvailableQty(productId: string): Promise<number> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      return 0;
    }

    const reserved = await this.sumReservedQty([productId]);
    return product.quantity - (reserved.get(productId) ?? 0);
  }

  async getAvailableQtyBatch(productIds: string[]): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const uniqueIds = [...new Set(productIds)];

    const products = await this.productsRepository.find({
      where: { id: In(uniqueIds) },
    });

    const reserved = await this.sumReservedQty(uniqueIds);

    return new Map(
      products.map((product) => [product.id, product.quantity - (reserved.get(product.id) ?? 0)]),
    );
  }

  async getGrossQtyBatch(productIds: string[]): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const uniqueIds = [...new Set(productIds)];

    const products = await this.productsRepository.find({
      where: { id: In(uniqueIds) },
    });

    return new Map(products.map((product) => [product.id, product.quantity]));
  }

  reconcileLines(lines: InventoryLine[], available: Map<string, number>): { changed: boolean } {
    let changed = false;

    for (const line of lines) {
      const maxQty = available.get(line.productId) ?? 0;
      if (line.qty > maxQty) {
        line.qty = maxQty;
        changed = true;
      }
    }

    return { changed };
  }

  async deductOnSubmit(lines: InventoryLine[]): Promise<void> {
    for (const line of lines) {
      const result = await this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set({ quantity: () => 'quantity - :deductQty' })
        .where('id = :productId AND quantity >= :deductQty', {
          productId: line.productId,
          deductQty: line.qty,
        })
        .execute();

      if (!result.affected) {
        throw new OrderInventoryChangedException();
      }
    }
  }

  async restoreOnCancel(lines: InventoryLine[]): Promise<void> {
    for (const line of lines) {
      const product = await this.productsRepository.findOne({
        where: { id: line.productId },
      });

      if (!product) {
        continue;
      }

      product.quantity += line.qty;
      await this.productsRepository.save(product);
    }
  }

  private async sumReservedQty(productIds: string[]): Promise<Map<string, number>> {
    const rows = await this.orderItemsRepository.find({
      where: {
        productId: In(productIds),
        order: {
          checkout: {
            status: CheckoutStatus.Active,
            expiresAt: MoreThan(new Date()),
          },
        },
      },
      select: { productId: true, qty: true },
    });

    return groupSumBy(
      rows,
      (row) => row.productId,
      (row) => row.qty,
    );
  }
}
