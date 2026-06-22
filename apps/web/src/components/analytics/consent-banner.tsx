'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useConsent } from '@/hooks/analytics';

export function ConsentBanner() {
  const t = useTranslations('analytics.consent');
  const { showBanner, accept, reject } = useConsent();

  if (!showBanner) {
    return null;
  }

  return (
    <Box
      component="aside"
      aria-live="polite"
      sx={{
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.snackbar,
        px: 2,
        pb: 2,
        pointerEvents: 'none',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          pointerEvents: 'auto',
          mx: 'auto',
          maxWidth: 720,
          p: 2,
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">{t('title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('description')}
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={accept}>
              {t('accept')}
            </Button>
            <Button variant="outlined" onClick={reject}>
              {t('reject')}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
