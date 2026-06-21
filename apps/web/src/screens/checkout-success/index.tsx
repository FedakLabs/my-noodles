'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/layout/page-container';
import { Link } from '@/i18n/navigation';

export function CheckoutSuccessScreen() {
  const t = useTranslations('checkout.success');

  return (
    <PageContainer>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography color="text.secondary">{t('description')}</Typography>
        <Button component={Link} href="/catalog" variant="contained">
          {t('backToCatalog')}
        </Button>
      </Stack>
    </PageContainer>
  );
}
