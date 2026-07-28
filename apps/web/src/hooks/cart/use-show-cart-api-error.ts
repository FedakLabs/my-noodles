'use client';

import { showToast } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { resolveCartErrorMessage } from '@/hooks/cart/cart-error-messages';

export function useShowCartApiError() {
  const t = useTranslations('cart');

  return useCallback(
    (
      error: unknown,
      fallback: 'mutationError' | 'checkoutError' = 'mutationError',
      productTitles?: Record<string, string>,
    ) => {
      showToast.error(resolveCartErrorMessage(t, error, fallback, productTitles));
    },
    [t],
  );
}
