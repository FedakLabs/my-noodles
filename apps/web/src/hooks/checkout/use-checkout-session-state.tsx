'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';

import { cartQueryKeys } from '@/api/cart';
import { type Checkout, checkoutsQueryKeys } from '@/api/checkouts';
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

  const isInProgress = checkout?.status === 'in_progress';
  const isCompleted = checkout?.status === 'completed';
  const isExpiredHold = checkout?.status === 'cancelled' && checkout.cancelledReason === 'expired';

  const errorCode: ApiErrorCode | undefined = error ? getApiErrorCode(error) : undefined;
  const isExpiredBySubmit = errorCode === 'checkout_expired';
  const isNotInProgressBySubmit = errorCode === 'checkout_not_in_progress';
  const isInventoryChanged = errorCode === 'order_inventory_changed';
  const isExpired = isExpiredHold || isExpiredBySubmit;
  const showSubmitErrorAlert = Boolean(error) && !isExpiredBySubmit && !isNotInProgressBySubmit;

  const submitErrorMessage = isInventoryChanged ? t('submitInventoryChanged') : t('error');

  const expiredDescription = t.rich('draftExpired', {
    catalog: (chunks) => <Link href="/catalog">{chunks}</Link>,
  });

  useEffect(() => {
    if (isExpired) {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
    }
  }, [isExpired, queryClient]);

  const onHoldExpired = useCallback(() => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.detail(checkoutId) }),
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() }),
    ]);
  }, [checkoutId, queryClient]);

  return {
    isInProgress,
    isCompleted,
    isExpired,
    isNotInProgressBySubmit,
    isInventoryChanged,
    showSubmitErrorAlert,
    submitErrorMessage,
    expiredDescription,
    onHoldExpired,
  };
}
