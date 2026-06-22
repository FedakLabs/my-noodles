import type { ProductSummaryDto } from '@my-noodles/api-clients/storefront';

import type { CartLine } from '@/hooks/cart/cart-store';

import type { Ga4Item } from './types';

export function priceMinorToMajor(priceMinor: number): number {
  return Number((priceMinor / 100).toFixed(2));
}

export function cartLineToGa4Item(line: Pick<CartLine, 'slug' | 'title' | 'priceMinor' | 'qty'>): Ga4Item {
  return {
    item_id: line.slug,
    item_name: line.title,
    price: priceMinorToMajor(line.priceMinor),
    quantity: line.qty,
  };
}

export function productToGa4Item(
  product: Pick<ProductSummaryDto, 'slug' | 'name' | 'priceMinor' | 'brand' | 'category'>,
  quantity = 1,
): Ga4Item {
  const item: Ga4Item = {
    item_id: product.slug,
    item_name: product.name ?? product.slug,
    price: priceMinorToMajor(product.priceMinor),
    quantity,
    item_category: product.category.slug,
  };

  if (product.brand?.slug) {
    item.item_brand = product.brand.slug;
  }

  return item;
}

export function sumItemsValueMinor(items: Array<Pick<CartLine, 'priceMinor' | 'qty'>>): number {
  return items.reduce((sum, item) => sum + item.priceMinor * item.qty, 0);
}
