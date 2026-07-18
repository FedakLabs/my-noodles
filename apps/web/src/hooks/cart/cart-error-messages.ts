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
): string {
  const code = getApiErrorCode(error);

  switch (code) {
    case 'cart_product_out_of_stock':
      return t('outOfStock');
    case 'cart_max_quantity_reached': {
      const payload = getApiErrorPayload(error) as CartErrorPayload | undefined;
      const maxQty = payload?.maxQty;
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
