'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/layout/page-container';

export function ContactsScreen() {
  const t = useTranslations('contacts');

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography>{t('description')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('telegram')}: {t('telegramHandle')}
        </Typography>
      </Stack>
    </PageContainer>
  );
}
