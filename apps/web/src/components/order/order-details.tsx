'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DeliveryMethod } from '@my-noodles/api-clients/storefront';
import { useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';

import { useDeliveryProviders } from '@/api/delivery';
import type { Order } from '@/api/orders';
import { CheckoutOrderCard } from '@/components/checkout/checkout-order-card';
import { CheckoutOrderItemsList } from '@/components/checkout/checkout-order-items-list';
import { CheckoutOrderSummary } from '@/components/checkout/checkout-order-summary';
import { formatEstimateDeliveryDate } from '@/components/checkout/delivery';
import { OrderStatusProgress } from '@/components/checkout/order-status-progress';
import { ShareMenu } from '@/components/share-menu/share-menu';
import { useAppLocale } from '@/hooks/locale';
import { absoluteUrl, localePath } from '@/shared/seo/urls';

type OrderDetailsProps = {
  order: Order;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === '') {
    return null;
  }

  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const t = useTranslations('checkout');
  const tSuccess = useTranslations('checkout.success');
  const tItems = useTranslations('checkout.items');
  const locale = useAppLocale();
  const { deliveryProviders } = useDeliveryProviders();

  const delivery = order.delivery;
  const selectedProvider = deliveryProviders?.find((provider) => provider.id === delivery?.provider);
  const providerLabel = selectedProvider?.label ?? delivery?.provider;
  const methodLabel =
    selectedProvider?.methods.find((item) => item.id === delivery?.method)?.label ??
    (delivery?.method === DeliveryMethod.WAREHOUSE
      ? t('delivery.methods.warehouse')
      : delivery?.method === DeliveryMethod.COURIER
        ? t('delivery.methods.courier')
        : t('delivery.methods.custom'));

  const warehouseLabel = delivery?.warehouseName
    ? delivery.warehouseNumber
      ? `${delivery.warehouseName} (${delivery.warehouseNumber})`
      : delivery.warehouseName
    : (delivery?.warehouseNumber ?? null);

  const estimatedDeliveryAt = delivery?.estimatedDeliveryAt ?? null;
  const estimatedDaysMin = delivery?.estimatedDaysMin ?? null;
  const estimatedDaysMax = delivery?.estimatedDaysMax ?? null;

  const shareUrl = useMemo(() => absoluteUrl(localePath(locale, `/orders/${order.id}`)), [locale, order.id]);

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ minWidth: 0, flex: 1 }}>
          {tSuccess('orderDetails')}
        </Typography>
        <ShareMenu
          shareUrl={shareUrl}
          shareTitle={tSuccess('orderDetails')}
          shareText={tSuccess('shareText')}
          ariaLabel={tSuccess('share')}
        />
      </Stack>

      <OrderStatusProgress status={order.status} />

      <CheckoutOrderCard aria-label={t('sections.receiver')}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">{t('sections.receiver')}</Typography>
          <DetailRow label={t('fields.lastName')} value={order.lastName} />
          <DetailRow label={t('fields.firstName')} value={order.firstName} />
          <DetailRow label={t('fields.phone')} value={order.phone} />
        </Stack>
      </CheckoutOrderCard>

      {delivery ? (
        <CheckoutOrderCard aria-label={t('sections.delivery')}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1">{t('sections.delivery')}</Typography>
            <DetailRow label={t('fields.provider')} value={providerLabel} />
            <DetailRow label={t('fields.method')} value={methodLabel} />
            <DetailRow label={t('fields.city')} value={delivery.city} />
            <DetailRow label={t('fields.postalCode')} value={delivery.postalCode} />
            {delivery.method === DeliveryMethod.WAREHOUSE || delivery.method === DeliveryMethod.CUSTOM ? (
              <DetailRow label={t('fields.branch')} value={warehouseLabel} />
            ) : null}
            {delivery.method === DeliveryMethod.COURIER || delivery.method === DeliveryMethod.CUSTOM ? (
              <>
                <DetailRow label={t('fields.street')} value={delivery.street} />
                <DetailRow label={t('fields.building')} value={delivery.building} />
                <DetailRow label={t('fields.apartment')} value={delivery.apartment} />
              </>
            ) : null}
            <DetailRow label={t('fields.notes')} value={delivery.notes} />

            {estimatedDeliveryAt || (estimatedDaysMin != null && estimatedDaysMax != null) ? (
              <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                <Typography variant="subtitle2">{t('delivery.estimateLabel')}</Typography>
                {estimatedDeliveryAt ? (
                  <Typography variant="body2">
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {t('delivery.estimateDateLabel')}{' '}
                    </Typography>
                    {formatEstimateDeliveryDate(estimatedDeliveryAt, locale)}
                  </Typography>
                ) : null}
                {estimatedDaysMin != null && estimatedDaysMax != null ? (
                  <Typography variant="body2">
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {t('delivery.estimateTermLabel')}{' '}
                    </Typography>
                    {t('delivery.estimateTerm', {
                      daysMin: estimatedDaysMin,
                      daysMax: estimatedDaysMax,
                    })}
                  </Typography>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        </CheckoutOrderCard>
      ) : null}

      <CheckoutOrderCard aria-label={tItems('title')}>
        <CheckoutOrderItemsList order={order} />
      </CheckoutOrderCard>

      <CheckoutOrderCard aria-label={tItems('summaryTitle')}>
        <CheckoutOrderSummary
          order={order}
          shippingCostMinor={delivery ? delivery.shippingCostMinor : undefined}
        />
      </CheckoutOrderCard>
    </Stack>
  );
}
