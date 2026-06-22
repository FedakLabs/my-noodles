import type { ProductDetailDto, ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { sendGTMEvent } from '@next/third-parties/google';

import type { CartLine } from '@/hooks/cart/cart-store';

import { isAnalyticsAllowed } from './consent';
import { cartLineToGa4Item, priceMinorToMajor, productToGa4Item, sumItemsValueMinor } from './ecommerce';
import type { Ga4Item, PurchasePayload } from './types';

function pushEcommerceEvent(event: string, ecommerce: Record<string, unknown>) {
  if (!isAnalyticsAllowed()) {
    return;
  }

  sendGTMEvent({ ecommerce: null });
  sendGTMEvent({ event, ecommerce });
}

function pushCustomEvent(event: string, params: Record<string, unknown> = {}) {
  if (!isAnalyticsAllowed()) {
    return;
  }

  sendGTMEvent({ event, ...params });
}

export function trackViewItemList(listId: string, listName: string, products: ProductSummaryDto[]) {
  if (products.length === 0) {
    return;
  }

  const currency = products[0]?.currency ?? 'UAH';
  const items = products.map((product) => productToGa4Item(product));
  const valueMinor = products.reduce((sum, product) => sum + product.priceMinor, 0);

  pushEcommerceEvent('view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    currency,
    value: priceMinorToMajor(valueMinor),
    items,
  });
}

export function trackViewItem(product: ProductDetailDto | ProductSummaryDto) {
  pushEcommerceEvent('view_item', {
    currency: product.currency,
    value: priceMinorToMajor(product.priceMinor),
    items: [productToGa4Item(product)],
  });
}

export function trackAddToCart(line: Omit<CartLine, 'qty'>, quantity: number) {
  pushEcommerceEvent('add_to_cart', {
    currency: line.currency,
    value: priceMinorToMajor(line.priceMinor * quantity),
    items: [cartLineToGa4Item({ ...line, qty: quantity })],
  });
}

export function trackRemoveFromCart(
  line: Pick<CartLine, 'slug' | 'title' | 'priceMinor' | 'currency' | 'qty'>,
) {
  pushEcommerceEvent('remove_from_cart', {
    currency: line.currency,
    value: priceMinorToMajor(line.priceMinor * line.qty),
    items: [cartLineToGa4Item(line)],
  });
}

export function trackBeginCheckout(items: CartLine[]) {
  if (items.length === 0) {
    return;
  }

  const currency = items[0]?.currency ?? 'UAH';
  const ga4Items: Ga4Item[] = items.map((item) => cartLineToGa4Item(item));

  pushEcommerceEvent('begin_checkout', {
    currency,
    value: priceMinorToMajor(sumItemsValueMinor(items)),
    items: ga4Items,
  });
}

export function trackPurchase(payload: PurchasePayload) {
  pushEcommerceEvent('purchase', {
    transaction_id: payload.transactionId,
    currency: payload.currency,
    value: priceMinorToMajor(payload.valueMinor),
    items: payload.items,
  });
}

export function trackClickTelegramOrder() {
  pushCustomEvent('click_telegram_order');
}
