'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDeadlineCountdown } from '@my-noodles/web-lib/hooks/deadline-countdown';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { Checkout } from '@/api/checkouts';
import { usePendingRouter } from '@/hooks/smooth/use-pending-router';
import { Link } from '@/i18n/navigation';

const ORDER_REDIRECT_MS = 5_000;

type CheckoutCompletedStateProps = {
  checkout: Checkout;
};

export function CheckoutCompletedState({ checkout }: CheckoutCompletedStateProps) {
  const tSuccess = useTranslations('checkout.success');
  const router = usePendingRouter();
  const orderId = checkout.order.id;
  const orderHref = `/orders/${orderId}`;
  const [redirectAt] = useState(() => new Date(Date.now() + ORDER_REDIRECT_MS).toISOString());

  const { remainingMs } = useDeadlineCountdown({
    expiresAt: redirectAt,
    onExpire: () => {
      router.replace(orderHref);
    },
  });

  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1_000));

  return (
    <Stack spacing={3} sx={{ width: '100%', alignItems: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start', width: '100%' }}>
        <Typography variant="h4">{tSuccess('title')}</Typography>
        <Typography color="text.secondary">{tSuccess('description')}</Typography>
        <Typography color="text.secondary">{tSuccess('bookmarkHint')}</Typography>
        <Typography color="text.secondary" component="div">
          {tSuccess.rich('catalogHint', {
            catalog: (chunks) => <Link href="/catalog">{chunks}</Link>,
          })}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', justifyContent: 'center' }}>
        <Typography
          component={Link}
          href={orderHref}
          variant="subtitle1"
          sx={{
            color: 'info.main',
            textDecoration: 'underline',
            '&:hover': { color: 'info.dark' },
          }}
        >
          {tSuccess('goToOrder')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {tSuccess('redirectCountdown', { seconds: secondsLeft })}
        </Typography>
      </Stack>
    </Stack>
  );
}
