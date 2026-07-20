'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';

import { cartQueries } from '@/api/cart';
import { type Checkout, checkoutsQueries } from '@/api/checkouts';
import { Link } from '@/i18n/navigation';
import { type ApiErrorCode, getApiErrorCode } from '@/shared/api-error';

type UseCheckoutSessionStateOptions = {
  checkoutId: string;
  checkout?: Checkout | null;
  error?: unknown;
};

export function useCheckoutSessionState({ checkoutId, checkout, error }: UseCheckoutSessionStateOptions) {
  const queryClient = useQueryClient();
  const t = useTranslations('checkout');

  const isActive = checkout?.status === 'active';
  const isCompleted = checkout?.status === 'completed';

  const errorCode: ApiErrorCode | undefined = error ? getApiErrorCode(error) : undefined;
  const isInactiveByMutation = errorCode === 'checkout_inactive';
  const isInventoryChanged = errorCode === 'order_inventory_changed';
  const isExpired = Boolean(checkout?.isExpired) || isInactiveByMutation;
  const showSubmitErrorAlert = Boolean(error) && !isInactiveByMutation;

  const submitErrorMessage = isInventoryChanged ? t('submitInventoryChanged') : t('error');

  const expiredDescription = t.rich('draftExpired', {
    catalog: (chunks) => <Link href="/catalog">{chunks}</Link>,
  });

  useEffect(() => {
    if (isExpired) {
      void queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
    }
  }, [isExpired, queryClient]);

  const onHoldExpired = useCallback(() => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: checkoutsQueries.detail(checkoutId).queryKey }),
      queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey }),
    ]);
  }, [checkoutId, queryClient]);

  return {
    isActive,
    isCompleted,
    isExpired,
    isInventoryChanged,
    showSubmitErrorAlert,
    submitErrorMessage,
    expiredDescription,
    onHoldExpired,
  };
}
