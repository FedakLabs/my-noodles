'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { OrderDeliveryEstimateDto } from '@my-noodles/api-clients/storefront';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { CheckoutDetailDto } from '@/api/checkouts';
import { useCurrency } from '@/hooks/currency';

type CheckoutOrderSummaryProps = {
  checkout: CheckoutDetailDto;
  deliveryEstimate: OrderDeliveryEstimateDto | null;
  footer?: ReactNode;
};

export function CheckoutOrderSummary({ checkout, deliveryEstimate, footer }: CheckoutOrderSummaryProps) {
  const t = useTranslations('checkout.items');
  const { formatCurrency } = useCurrency();

  const shippingMinor = deliveryEstimate?.shippingCostMinor ?? null;
  const grandTotalMinor = shippingMinor != null ? checkout.totalMinor + shippingMinor : checkout.totalMinor;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">{t('products')}</Typography>
        <Typography variant="subtitle2">{formatCurrency(checkout.totalMinor, checkout.currency)}</Typography>
      </Stack>

      {shippingMinor != null ? (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {t('shipping')}
            </Typography>
            <Typography variant="body2">{formatCurrency(shippingMinor, checkout.currency)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">{t('grandTotal')}</Typography>
            <Typography variant="subtitle2">{formatCurrency(grandTotalMinor, checkout.currency)}</Typography>
          </Stack>
        </>
      ) : null}

      {footer}
    </Stack>
  );
}
