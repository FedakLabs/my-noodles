import { type FindOptionsWhere, MoreThan } from 'typeorm';

import type { Product } from './product.entity';

/** TypeORM where clause for customer-facing product queries (catalog, feed, PDP, etc.). */
export function storefrontProductWhere(): FindOptionsWhere<Product> {
  return {
    available: true,
    quantity: MoreThan(0),
  };
}

export function isStorefrontListable(product: Pick<Product, 'available' | 'quantity'>): boolean {
  return product.available && product.quantity > 0;
}

/** Units that can be sold; unavailable products are never sellable regardless of stock. */
export function sellableQuantity(product: Pick<Product, 'available' | 'quantity'>): number {
  return product.available ? product.quantity : 0;
}
