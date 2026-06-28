'use client';

import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useDeadlineCountdown } from '@my-noodles/web-lib/hooks';
import { useFormatter, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

type CheckoutHoldTimerProps = {
  expiresAt: string;
  onExpired: () => void;
};

export function CheckoutHoldTimer({ expiresAt, onExpired }: CheckoutHoldTimerProps) {
  const t = useTranslations('checkout.hold');
  const format = useFormatter();
  const { remainingMs, isExpired, formattedRemaining } = useDeadlineCountdown({
    expiresAt,
    onExpire: onExpired,
  });

  const deadlineTime = format.dateTime(new Date(expiresAt), {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isExpired) {
    return (
      <Alert severity="error">
        <Typography variant="body2" component="div">
          {t.rich('expired', {
            catalog: (chunks) => <Link href="/catalog">{chunks}</Link>,
          })}
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity={remainingMs <= 60_000 ? 'warning' : 'info'}>
      <Typography variant="body2">
        {t('remaining', { deadline: deadlineTime, remaining: formattedRemaining })}
      </Typography>
    </Alert>
  );
}
