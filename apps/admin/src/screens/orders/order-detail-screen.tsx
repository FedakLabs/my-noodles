import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { OrderStatus } from '@my-noodles/api-clients/admin';
import { CopyableField } from '@my-noodles/ui';
import { Link, useParams } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useArchiveOrder,
  useArriveOrder,
  useCompleteOrder,
  useConfirmOrder,
  useOrder,
  useReturnOrder,
  useSendOrder,
} from '@/api/orders';
import { CancelOrderModal, type CancelOrderModalRef } from '@/components/orders/cancel-order-modal';
import { OrderStatusChip } from '@/components/orders/order-status-chip';
import { ROUTE_NAMES } from '@/router/route-names';
import { formatCurrency } from '@/utils/format-currency';

export function OrderDetailScreen() {
  const { t } = useTranslation(['orders', 'common']);
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const { order, orderIsLoading, orderIsError } = useOrder(orderId);
  const { confirmOrderAsync, confirmOrderIsPending } = useConfirmOrder(orderId);
  const { sendOrderAsync, sendOrderIsPending } = useSendOrder(orderId);
  const { arriveOrderAsync, arriveOrderIsPending } = useArriveOrder(orderId);
  const { completeOrderAsync, completeOrderIsPending } = useCompleteOrder(orderId);
  const { returnOrderAsync, returnOrderIsPending } = useReturnOrder(orderId);
  const { archiveOrderAsync, archiveOrderIsPending } = useArchiveOrder(orderId);
  const cancelModalRef = useRef<CancelOrderModalRef>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const transitionIsPending =
    confirmOrderIsPending ||
    sendOrderIsPending ||
    arriveOrderIsPending ||
    completeOrderIsPending ||
    returnOrderIsPending ||
    archiveOrderIsPending;

  async function applyTransition(status: OrderStatus) {
    setActionError(null);
    if (status === 'cancelled') {
      if (!order) {
        return;
      }

      cancelModalRef.current?.open({
        orderId: order.id,
        customerName: [order.firstName, order.lastName].filter(Boolean).join(' '),
        phone: order.phone ?? '',
        totalMinor: order.grandTotalMinor ?? order.totalMinor,
        currency: order.currency,
      });
      return;
    }

    try {
      switch (status) {
        case 'confirmed':
          await confirmOrderAsync();
          break;
        case 'sent':
          await sendOrderAsync();
          break;
        case 'arrived':
          await arriveOrderAsync();
          break;
        case 'completed':
          await completeOrderAsync();
          break;
        case 'returned':
          await returnOrderAsync();
          break;
        case 'archived':
          await archiveOrderAsync();
          break;
        default:
          throw new Error(`Unsupported order action: ${status}`);
      }
    } catch {
      setActionError(t('orders:detail.transitionFailed'));
    }
  }

  if (orderIsLoading) {
    return <Typography>{t('common:states.loading')}</Typography>;
  }

  if (orderIsError || !order) {
    return <Typography color="error">{t('orders:detail.notFound')}</Typography>;
  }

  const delivery = order.delivery;
  const providerLabel = delivery
    ? t(`orders:delivery.providers.${delivery.provider}`, { defaultValue: delivery.provider })
    : null;
  const methodLabel = delivery
    ? t(`orders:delivery.methods.${delivery.method}`, { defaultValue: delivery.method })
    : null;
  const shippingLabel =
    delivery?.shippingCostMinor != null
      ? formatCurrency(delivery.shippingCostMinor, order.currency)
      : t('orders:detail.shippingCarrierTariff');

  return (
    <Stack spacing={2}>
      <Button component={Link} to={ROUTE_NAMES.orders} size="small" sx={{ alignSelf: 'flex-start' }}>
        {t('orders:detail.backToOrders')}
      </Button>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('orders:detail.title')}
          </Typography>
          <CopyableField
            value={order.id}
            copyLabel={t('common:actions.copy')}
            copiedLabel={t('common:actions.copied')}
          />

          {actionError ? <Alert severity="error">{actionError}</Alert> : null}

          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography component="span">
                <strong>{t('orders:detail.status')}:</strong>
              </Typography>
              <OrderStatusChip status={order.status} />
            </Stack>
            <Typography>
              <strong>{t('orders:detail.customer')}:</strong>{' '}
              {[order.firstName, order.lastName].filter(Boolean).join(' ') || '—'}
            </Typography>
            <CopyableField
              label={{
                text: `${t('orders:detail.phone')}:`,
                color: 'text.primary',
                sx: { fontWeight: 700 },
              }}
              value={order.phone ?? ''}
              copyLabel={t('common:actions.copy')}
              copiedLabel={t('common:actions.copied')}
            />
            <Typography>
              <strong>{t('orders:detail.total')}:</strong>{' '}
              {formatCurrency(order.grandTotalMinor ?? order.totalMinor, order.currency)}
            </Typography>
            {order.cancelledReason ? (
              <Typography>
                <strong>{t('orders:detail.cancelReason')}:</strong>{' '}
                {t(`orders:cancel.reasonLabels.${order.cancelledReason}`)}
              </Typography>
            ) : null}
          </Stack>

          {delivery ? (
            <Stack spacing={0.5}>
              <Typography variant="h6">{t('orders:detail.delivery')}</Typography>
              <Typography>
                {providerLabel} · {methodLabel}
              </Typography>
              <Typography>
                {[delivery.city, delivery.warehouseName, delivery.street].filter(Boolean).join(' · ') || '—'}
              </Typography>
              <Typography>
                <strong>{t('orders:detail.shipping')}:</strong> {shippingLabel}
              </Typography>
            </Stack>
          ) : null}

          <Stack spacing={1}>
            <Typography variant="h6">{t('orders:detail.items')}</Typography>
            {order.items.map((item) => (
              <Typography key={item.id}>
                {item.titleSnapshot} × {item.qty} — {formatCurrency(item.priceMinorSnapshot, order.currency)}
              </Typography>
            ))}
          </Stack>

          {(order.availableTransitions?.length ?? 0) > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {order.availableTransitions?.map((status) => (
                <Button
                  key={status}
                  variant={status === 'cancelled' ? 'outlined' : 'contained'}
                  color={status === 'cancelled' ? 'error' : 'primary'}
                  disabled={transitionIsPending}
                  onClick={() => void applyTransition(status as OrderStatus)}
                >
                  {t('orders:transitions.mark', { status: t(`orders:status.${status}`) })}
                </Button>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">{t('orders:detail.noTransitions')}</Typography>
          )}
        </Stack>
      </Paper>

      <CancelOrderModal ref={cancelModalRef} />
    </Stack>
  );
}
