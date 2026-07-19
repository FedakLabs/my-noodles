'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { Checkout } from '@/api/checkouts';
import { useCurrency } from '@/hooks/currency';

type CheckoutOrderSummaryProps = {
  checkout: Checkout;
  shippingCostMinor: number | null;
  footer?: ReactNode;
};

export function CheckoutOrderSummary({ checkout, shippingCostMinor, footer }: CheckoutOrderSummaryProps) {
  const t = useTranslations('checkout.items');
  const { formatCurrency } = useCurrency();

  const { totalMinor, grandTotalMinor = totalMinor, currency } = checkout.order;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">{t('products')}</Typography>
        <Typography variant="subtitle2">{formatCurrency(totalMinor, currency)}</Typography>
      </Stack>

      {shippingCostMinor != null ? (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {t('shipping')}
            </Typography>
            <Typography variant="body2">{formatCurrency(shippingCostMinor, currency)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">{t('grandTotal')}</Typography>
            <Typography variant="subtitle2">{formatCurrency(grandTotalMinor, currency)}</Typography>
          </Stack>
        </>
      ) : null}

      {footer}
    </Stack>
  );
}
