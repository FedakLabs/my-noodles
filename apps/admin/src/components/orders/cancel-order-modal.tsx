import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { OrderCancelledReason } from '@my-noodles/api-clients/admin';
import { CopyableField, Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { type Ref, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCancelOrder } from '@/api/orders';
import { formatCurrency } from '@/utils/format-currency';

const CANCEL_REASONS: OrderCancelledReason[] = ['customer_request', 'out_of_stock'];

type CancelOrderModalData = {
  orderId: string;
  customerName: string;
  phone: string;
  totalMinor: number;
  currency: string;
};

export type CancelOrderModalRef = ModalRef<CancelOrderModalData>;

function CancelOrderModalContent() {
  const { t } = useTranslation(['orders', 'common']);
  const { data, close, setDisableClose } = useModal<CancelOrderModalData>();
  const { cancelOrderAsync, cancelOrderIsPending } = useCancelOrder(data.orderId);
  const [cancelReason, setCancelReason] = useState<OrderCancelledReason>('customer_request');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisableClose(cancelOrderIsPending);
    return () => {
      setDisableClose(false);
    };
  }, [cancelOrderIsPending, setDisableClose]);

  async function confirmCancel() {
    setError(null);
    try {
      await cancelOrderAsync({ cancelledReason: cancelReason });
      close();
    } catch {
      setError(t('orders:detail.cancelFailed'));
    }
  }

  return (
    <>
      <Modal.Header title={t('orders:cancel.title')} />
      <Modal.Body scrollable>
        <Stack spacing={1.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack spacing={0.5}>
            <CopyableField
              label={{
                text: `${t('orders:detail.title')}:`,
                color: 'text.primary',
                sx: { fontWeight: 700 },
              }}
              value={data.orderId}
              copyLabel={t('common:actions.copy')}
              copiedLabel={t('common:actions.copied')}
            />
            <Typography variant="body2">
              <strong>{t('orders:detail.customer')}:</strong> {data.customerName || '—'}
            </Typography>
            <CopyableField
              label={{
                text: `${t('orders:detail.phone')}:`,
                color: 'text.primary',
                sx: { fontWeight: 700 },
              }}
              value={data.phone}
              copyLabel={t('common:actions.copy')}
              copiedLabel={t('common:actions.copied')}
            />
            <Typography variant="body2">
              <strong>{t('orders:detail.total')}:</strong> {formatCurrency(data.totalMinor, data.currency)}
            </Typography>
          </Stack>

          <TextField
            select
            fullWidth
            margin="dense"
            label={t('orders:cancel.reason')}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value as OrderCancelledReason)}
            disabled={cancelOrderIsPending}
          >
            {CANCEL_REASONS.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {t(`orders:cancel.reasonLabels.${reason}`)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close} disabled={cancelOrderIsPending}>
          {t('common:actions.back')}
        </Button>
        <Button
          color="error"
          variant="contained"
          loading={cancelOrderIsPending}
          onClick={() => void confirmCancel()}
        >
          {t('orders:cancel.confirm')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function CancelOrderModal({ ref }: { ref?: Ref<CancelOrderModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="sm">
      <CancelOrderModalContent />
    </Modal>
  );
}
