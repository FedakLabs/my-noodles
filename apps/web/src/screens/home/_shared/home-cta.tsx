'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useAnalyticsActions } from '@/hooks/analytics/use-analytics';
import { Link } from '@/i18n/navigation';
import { TELEGRAM_SUPPORT_URL } from '@/shared/urls';

import { SectionReveal } from './section-reveal';

type HomeCtaProps = {
  headline: string;
  body: string;
  primaryHref?: '/catalog' | '/feed' | '/collections';
  primaryLabel?: string;
  secondaryHref?: '/catalog' | '/feed' | '/collections';
  secondaryLabel?: string;
};

export function HomeCta({
  headline,
  body,
  primaryHref = '/catalog',
  primaryLabel,
  secondaryHref = '/feed',
  secondaryLabel,
}: HomeCtaProps) {
  const t = useTranslations('home.shared');
  const { trackClickTelegramOrder } = useAnalyticsActions();

  return (
    <SectionReveal
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 6, md: 8 },
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 560, mx: 'auto', alignItems: 'center' }}>
        <Typography variant="h4" component="h2">
          {headline}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {body}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'center' }}
        >
          <Button component={Link} href={primaryHref} variant="contained" size="large">
            {primaryLabel ?? t('startExploring')}
          </Button>
          <Button component={Link} href={secondaryHref} variant="outlined" size="large">
            {secondaryLabel ?? t('exploreFeed')}
          </Button>
        </Stack>
        <Button
          href={TELEGRAM_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          onClick={() => trackClickTelegramOrder()}
        >
          {t('telegramCta')}
        </Button>
      </Stack>
    </SectionReveal>
  );
}
