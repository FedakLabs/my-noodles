'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { feedMutedTextSx } from '@/components/feed/feed-chrome';

type FeedErrorStateProps = {
  onRetry: () => void;
  retrying: boolean;
};

export function FeedErrorState({ onRetry, retrying }: FeedErrorStateProps) {
  const t = useTranslations('feed');
  const theme = useTheme();

  return (
    <Stack
      spacing={2}
      sx={{
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="body1" sx={feedMutedTextSx(theme)}>
        {t('error')}
      </Typography>
      <Button type="button" variant="contained" onClick={onRetry} disabled={retrying} data-feed-no-swipe>
        {retrying ? t('end.tryingAgain') : t('end.tryAgain')}
      </Button>
    </Stack>
  );
}
