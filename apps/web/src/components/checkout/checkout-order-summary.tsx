'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { Order } from '@/api/orders';
import { useCurrency } from '@/hooks/currency';

type CheckoutOrderSummaryProps = {
  order: Order;
  /**
   * `undefined` — no estimate yet (hide shipping + grand total).
   * `null` — estimate with unknown cost (carrier tariff copy).
   * `number` — known shipping in minor units.
   */
  shippingCostMinor: number | null | undefined;
  footer?: ReactNode;
};

export function CheckoutOrderSummary({ order, shippingCostMinor, footer }: CheckoutOrderSummaryProps) {
  const t = useTranslations('checkout.items');
  const { formatCurrency } = useCurrency();

  const { totalMinor, grandTotalMinor = totalMinor, currency } = order;
  const showShipping = shippingCostMinor !== undefined;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">{t('products')}</Typography>
        <Typography variant="subtitle2">{formatCurrency(totalMinor, currency)}</Typography>
      </Stack>

      {showShipping ? (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {t('shipping')}
            </Typography>
            <Typography variant="body2">
              {shippingCostMinor != null
                ? formatCurrency(shippingCostMinor, currency)
                : t('shippingCarrierTariff')}
            </Typography>
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
