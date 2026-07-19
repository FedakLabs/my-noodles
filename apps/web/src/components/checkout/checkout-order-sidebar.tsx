'use client';

import type { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { Checkout } from '@/api/checkouts';

import { CheckoutOrderCard } from './checkout-order-card';
import { CheckoutOrderItemsList } from './checkout-order-items-list';
import { CheckoutOrderSummary } from './checkout-order-summary';

const DESKTOP_ORDER_SIDEBAR_STICKY_TOP = 80;

type CheckoutOrderSidebarProps = {
  checkout: Checkout;
  footer?: ReactNode;
  sticky?: boolean;
  sx?: BoxProps['sx'];
};

export function CheckoutOrderSidebar({ checkout, footer, sticky = false, sx }: CheckoutOrderSidebarProps) {
  const t = useTranslations('checkout.items');

  return (
    <Stack
      spacing={2}
      sx={{
        width: '100%',
        alignSelf: 'start',
        ...(sticky
          ? {
              position: 'sticky',
              top: DESKTOP_ORDER_SIDEBAR_STICKY_TOP,
            }
          : null),
        ...sx,
      }}
    >
      <CheckoutOrderCard aria-label={t('title')}>
        <CheckoutOrderItemsList checkout={checkout} />
      </CheckoutOrderCard>

      <CheckoutOrderCard aria-label={t('summaryTitle')}>
        <CheckoutOrderSummary
          checkout={checkout}
          shippingCostMinor={checkout.deliveryEstimate?.shippingCostMinor ?? null}
          footer={footer}
        />
      </CheckoutOrderCard>
    </Stack>
  );
}
