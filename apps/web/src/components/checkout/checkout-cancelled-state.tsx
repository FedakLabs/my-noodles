'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

export function CheckoutCancelledState({ title, description }: { title?: string; description?: ReactNode }) {
  const t = useTranslations('checkout.cancelled');

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h5">{title ?? t('title')}</Typography>
      <Typography color="text.secondary" component="div">
        {description ?? t('description')}
      </Typography>
      <Button component={Link} href="/catalog" variant="contained">
        {t('backToCatalog')}
      </Button>
    </Stack>
  );
}
