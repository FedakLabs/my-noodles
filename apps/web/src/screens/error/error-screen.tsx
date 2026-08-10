'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/layout/page-container';
import { Link } from '@/i18n/navigation';

type ErrorScreenProps = {
  reset: () => void;
};

export function ErrorScreen({ reset }: ErrorScreenProps) {
  const t = useTranslations('error');

  return (
    <PageContainer>
      <Stack spacing={2} sx={{ py: 6, alignItems: 'flex-start' }}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography color="text.secondary">{t('description')}</Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={reset}>
            {t('ctaRetry')}
          </Button>
          <Button component={Link} href="/" variant="outlined">
            {t('ctaHome')}
          </Button>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
