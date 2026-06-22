'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/layout/page-container';
import { useAnalyticsActions } from '@/hooks/analytics';
import { TELEGRAM_SUPPORT_URL } from '@/shared/urls';

export function ContactsScreen() {
  const t = useTranslations('contacts');
  const { trackClickTelegramOrder } = useAnalyticsActions();

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography>{t('description')}</Typography>
        <Button
          component="a"
          href={TELEGRAM_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          onClick={() => trackClickTelegramOrder()}
        >
          {t('telegramCta', { handle: t('telegramHandle') })}
        </Button>
      </Stack>
    </PageContainer>
  );
}
