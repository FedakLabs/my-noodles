'use client';

import type { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { DeliveryMethod, type OrderDeliveryEstimateDto } from '@my-noodles/api-clients/storefront';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { Checkout } from '@/api/checkouts';

import { CheckoutDeliveryEstimate } from './checkout-delivery-fields';
import { CheckoutOrderCard } from './checkout-order-card';
import { CheckoutOrderItemsList } from './checkout-order-items-list';
import { CheckoutOrderSummary } from './checkout-order-summary';

const DESKTOP_ORDER_SIDEBAR_STICKY_TOP = 80;

type CheckoutOrderSidebarProps = {
  checkout: Checkout;
  footer?: ReactNode;
  sticky?: boolean;
  sx?: BoxProps['sx'];
  deliveryEstimate?: OrderDeliveryEstimateDto | null;
  deliveryEstimateIsLoading?: boolean;
  deliveryMethod?: DeliveryMethod;
};

export function CheckoutOrderSidebar({
  checkout,
  footer,
  sticky = false,
  sx,
  deliveryEstimate = null,
  deliveryEstimateIsLoading = false,
  deliveryMethod = DeliveryMethod.WAREHOUSE,
}: CheckoutOrderSidebarProps) {
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
        <CheckoutOrderItemsList order={checkout.order} />
      </CheckoutOrderCard>

      <CheckoutDeliveryEstimate
        estimate={deliveryEstimate}
        isLoading={deliveryEstimateIsLoading}
        method={deliveryMethod}
      />

      <CheckoutOrderCard aria-label={t('summaryTitle')}>
        <CheckoutOrderSummary
          order={checkout.order}
          shippingCostMinor={deliveryEstimate?.shippingCostMinor}
          footer={footer}
        />
      </CheckoutOrderCard>
    </Stack>
  );
}
