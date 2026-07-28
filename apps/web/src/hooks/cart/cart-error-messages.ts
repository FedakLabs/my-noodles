'use client';

import type { useTranslations } from 'next-intl';

import { getApiErrorCode, getApiErrorPayload } from '@/shared/api-error';

type CartErrorPayload = {
  maxQty?: number;
  productId?: string;
};

type CartTranslator = ReturnType<typeof useTranslations<'cart'>>;

export function resolveCartErrorMessage(
  t: CartTranslator,
  error: unknown,
  fallback: 'mutationError' | 'checkoutError' = 'mutationError',
  productTitles?: Record<string, string>,
): string {
  const code = getApiErrorCode(error);
  const payload = getApiErrorPayload(error) as CartErrorPayload | undefined;
  const productId = payload?.productId;
  const title = productId != null ? productTitles?.[productId] : undefined;

  switch (code) {
    case 'cart_product_out_of_stock':
      return title ? t('outOfStockNamed', { title }) : t('outOfStock');
    case 'cart_max_quantity_reached': {
      const maxQty = payload?.maxQty;
      if (title && maxQty != null) {
        return t('maxQuantityNamed', { title, maxQty });
      }
      return maxQty != null ? t('maxQuantity', { maxQty }) : t('maxQuantityFallback');
    }
    case 'cart_inventory_changed':
      return t('inventoryChanged');
    case 'cart_empty':
      return fallback === 'checkoutError' ? t('checkoutItemsUnavailable') : t('empty');
    default:
      return t(fallback);
  }
}
