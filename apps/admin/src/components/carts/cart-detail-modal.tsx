import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AdminCartDetailDto } from '@my-noodles/api-clients/admin';
import { CopyableField, Modal, type ModalRef, useModal } from '@my-noodles/ui';
import { type ReactNode, type Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { useCart } from '@/api/carts';
import { formatCurrency } from '@/utils/format-currency';

type CartDetailModalData = {
  visitorSessionId: string;
};

export type CartDetailModalRef = ModalRef<CartDetailModalData>;

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

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('uk', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function CartDetailContent({ cart }: { cart: AdminCartDetailDto }) {
  const { t } = useTranslation(['carts', 'common']);

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1.5}>
        <CopyableField
          label={t('carts:detail.visitorId')}
          value={cart.visitorSessionId}
          copyLabel={t('common:actions.copy')}
          copiedLabel={t('common:actions.copied')}
        />
        <DetailRow label={t('carts:detail.cartExpiresAt')} value={formatDateTime(cart.cartExpiresAt)} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('carts:detail.items')}</Typography>
        {cart.items.length === 0 ? (
          <Typography color="text.secondary">{t('carts:detail.emptyItems')}</Typography>
        ) : (
          <Stack spacing={1}>
            {cart.items.map((item) => (
              <Stack
                key={item.productId}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                useFlexGap
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'baseline' } }}
              >
                <Typography variant="body2">
                  {item.name} ({item.slug})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  × {item.qty} · {formatCurrency(item.unitPriceMinor, item.currency)} →{' '}
                  {formatCurrency(item.lineTotalMinor, item.currency)}
                </Typography>
              </Stack>
            ))}
            <Typography variant="subtitle2">
              {t('carts:detail.total')}: {formatCurrency(cart.totalMinor, cart.currency)}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

function CartDetailModalContent() {
  const { t } = useTranslation(['carts', 'common']);
  const { data, close } = useModal<CartDetailModalData>();
  const visitorSessionId = data?.visitorSessionId ?? '';
  const { cart, cartIsLoading, cartIsError } = useCart(visitorSessionId);

  return (
    <>
      <Modal.Header>
        <Typography variant="h6">{t('carts:detail.title')}</Typography>
      </Modal.Header>
      <Modal.Body>
        {cartIsLoading ? <Typography color="text.secondary">{t('common:states.loading')}</Typography> : null}
        {cartIsError ? <Typography color="error">{t('carts:detail.loadError')}</Typography> : null}
        {cart ? <CartDetailContent cart={cart} /> : null}
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close}>{t('common:actions.back')}</Button>
      </Modal.Footer>
    </>
  );
}

export function CartDetailModal({ ref }: { ref?: Ref<CartDetailModalRef> }) {
  return (
    <Modal ref={ref} maxWidth="lg">
      <CartDetailModalContent />
    </Modal>
  );
}
