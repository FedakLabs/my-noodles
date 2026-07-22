'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useAnalyticsActions } from '@/hooks/analytics/use-analytics';
import { Link, useRouter } from '@/i18n/navigation';
import { TELEGRAM_SUPPORT_URL } from '@/shared/urls';

import { SectionReveal, startViewTransitionNav } from '../../_shared';

export function StartReelCta() {
  const t = useTranslations('home.variants.c');
  const tShared = useTranslations('home.shared');
  const router = useRouter();
  const { trackClickTelegramOrder } = useAnalyticsActions();

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 6, md: 8 }, textAlign: 'center' }}>
      <Stack spacing={2} sx={{ maxWidth: 560, mx: 'auto', alignItems: 'center' }}>
        <Typography variant="h4" component="h2">
          {t('ctaHeadline')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('ctaBody')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            size="large"
            onClick={() => startViewTransitionNav('/feed', (href) => router.push(href))}
          >
            {t('ctaFeed')}
          </Button>
          <Button component={Link} href="/catalog" variant="outlined" size="large">
            {tShared('exploreCatalog')}
          </Button>
        </Stack>
        <Button
          href={TELEGRAM_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          onClick={() => trackClickTelegramOrder()}
        >
          {tShared('telegramCta')}
        </Button>
      </Stack>
    </SectionReveal>
  );
}
