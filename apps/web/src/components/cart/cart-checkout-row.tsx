'use client';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Checkout } from '@my-noodles/api-clients/storefront';
import { iconStyle } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { useCancelCheckout } from '@/api/checkouts';
import { useCurrency } from '@/hooks/currency';
import { Link } from '@/i18n/navigation';

type CartCheckoutRowProps = {
  checkout: Checkout;
  onClose: () => void;
};

export function CartCheckoutRow({ checkout, onClose }: CartCheckoutRowProps) {
  const t = useTranslations('cart.active');
  const { formatCurrency } = useCurrency();
  const { cancelCheckout, cancelCheckoutIsPending } = useCancelCheckout();

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        bgcolor: 'action.hover',
      }}
    >
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2">
          {t('summary', { count: checkout.order.items.reduce((sum, item) => sum + item.qty, 0) })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatCurrency(checkout.order.totalMinor, checkout.order.currency)}
        </Typography>
        <Typography
          component={Link}
          href={`/checkout/${checkout.id}`}
          variant="body2"
          onClick={onClose}
          sx={{ fontWeight: 600 }}
        >
          {t('continue')}
        </Typography>
      </Stack>
      <IconButton
        aria-label={t('cancel')}
        disabled={cancelCheckoutIsPending}
        onClick={() => {
          cancelCheckout(checkout.id);
        }}
      >
        <CloseIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
      </IconButton>
    </Stack>
  );
}
