import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { OrderDelivery, OrderStatus } from '@my-noodles/api-clients/admin';
import { CopyableField, Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
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
import { ProductDetailModalContent } from '@/components/products/product-detail-modal';
import { formatCurrency } from '@/utils/format-currency';

type OrderDetailModalData = {
  orderId: string;
};

export type OrderDetailModalRef = ModalRef<OrderDetailModalData>;

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

function formatDeliveryDetails(delivery: OrderDelivery): string {
  const warehouse =
    delivery.warehouseName != null && delivery.warehouseNumber != null
      ? `${delivery.warehouseName} (${delivery.warehouseNumber})`
      : (delivery.warehouseName ?? delivery.warehouseNumber);
  const streetLine = [delivery.street, delivery.building, delivery.apartment].filter(Boolean).join(', ');

  return (
    [delivery.city, delivery.postalCode, warehouse, streetLine || null, delivery.notes]
      .filter(Boolean)
      .join(' · ') || '—'
  );
}

function OrderDetailView({
  orderId,
  onOpenProduct,
}: {
  orderId: string;
  onOpenProduct: (productId: string) => void;
}) {
  const { t } = useTranslation(['orders', 'common']);
  const { close, setDisableClose } = useModal<OrderDetailModalData>();
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

  useEffect(() => {
    setDisableClose(transitionIsPending);
    return () => {
      setDisableClose(false);
    };
  }, [setDisableClose, transitionIsPending]);

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

  const delivery = order?.delivery;
  const providerLabel = delivery
    ? t(`orders:delivery.providers.${delivery.provider}`, { defaultValue: delivery.provider })
    : null;
  const methodLabel = delivery
    ? t(`orders:delivery.methods.${delivery.method}`, { defaultValue: delivery.method })
    : null;
  const shippingLabel =
    delivery?.shippingCostMinor != null && order
      ? formatCurrency(delivery.shippingCostMinor, order.currency)
      : t('orders:detail.shippingCarrierTariff');

  return (
    <>
      <Modal.Header
        title={
          orderId ? (
            <CopyableField
              label={{
                text: `${t('orders:detail.title')}:`,
                variant: 'h6',
                color: 'text.primary',
                sx: { fontWeight: 600 },
              }}
              value={{
                text: orderId,
                variant: 'h6',
                sx: { fontWeight: 600 },
              }}
              copyLabel={t('common:actions.copy')}
              copiedLabel={t('common:actions.copied')}
            />
          ) : (
            t('orders:detail.title')
          )
        }
      />
      <Modal.Body scrollable>
        {orderIsLoading ? <Typography>{t('common:states.loading')}</Typography> : null}
        {orderIsError || (!orderIsLoading && !order) ? (
          <Typography color="error">{t('orders:detail.notFound')}</Typography>
        ) : null}

        {order ? (
          <Stack spacing={2}>
            {actionError ? <Alert severity="error">{actionError}</Alert> : null}

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography component="span">
                  <strong>{t('orders:detail.status')}:</strong>
                </Typography>
                <OrderStatusChip status={order.status} />
                {order.cancelledReason ? (
                  <Typography component="span" color="text.secondary">
                    ({t(`orders:cancel.reasonLabels.${order.cancelledReason}`)})
                  </Typography>
                ) : null}
              </Stack>
              <Typography>
                <strong>{t('orders:detail.total')}:</strong>{' '}
                {formatCurrency(order.grandTotalMinor ?? order.totalMinor, order.currency)}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography component="span">
                  <strong>{t('orders:detail.customer')}:</strong>{' '}
                  {[order.firstName, order.lastName].filter(Boolean).join(' ') || '—'}
                </Typography>
                {order.phone ? (
                  <CopyableField
                    value={`(${order.phone})`}
                    copyText={order.phone}
                    copyLabel={t('common:actions.copy')}
                    copiedLabel={t('common:actions.copied')}
                  />
                ) : null}
              </Stack>
            </Stack>

            {delivery ? (
              <Stack spacing={1.5}>
                <Typography variant="h6">{t('orders:detail.delivery')}</Typography>
                <DetailRow label={t('orders:delivery.provider')} value={providerLabel} />
                <DetailRow label={t('orders:delivery.method')} value={methodLabel} />
                <DetailRow label={t('orders:delivery.details')} value={formatDeliveryDetails(delivery)} />
                <DetailRow label={t('orders:detail.shipping')} value={shippingLabel} />
              </Stack>
            ) : null}

            <Stack spacing={1}>
              <Typography variant="h6">{t('orders:detail.items')}</Typography>
              {order.items.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
                >
                  <Typography
                    component="button"
                    type="button"
                    color="primary"
                    onClick={() => onOpenProduct(item.productId)}
                    sx={{
                      border: 0,
                      padding: 0,
                      margin: 0,
                      background: 'none',
                      cursor: 'pointer',
                      font: 'inherit',
                      textAlign: 'left',
                      textDecoration: 'underline',
                    }}
                  >
                    {item.titleSnapshot}
                  </Typography>
                  <Typography component="span">
                    × {item.qty} — {formatCurrency(item.priceMinorSnapshot, order.currency)}
                  </Typography>
                </Stack>
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
        ) : null}
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close} disabled={transitionIsPending}>
          {t('common:actions.back')}
        </Button>
      </Modal.Footer>
      <CancelOrderModal ref={cancelModalRef} />
    </>
  );
}

function OrderDetailModalContent() {
  const { data, isOpen } = useModal<OrderDetailModalData>();
  const orderId = data?.orderId ?? '';
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProductId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setProductId(null);
  }, [orderId]);

  if (productId && orderId) {
    return <ProductDetailModalContent productId={productId} onBack={() => setProductId(null)} />;
  }

  return <OrderDetailView orderId={orderId} onOpenProduct={setProductId} />;
}

export function OrderDetailModal({ ref }: { ref?: Ref<OrderDetailModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="lg">
      <OrderDetailModalContent />
    </Modal>
  );
}
