'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useInfiniteLoadMore } from '@/hooks/infinite-load-more';

type InfiniteLoadMoreProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function InfiniteLoadMore({ hasMore, isLoading, onLoadMore }: InfiniteLoadMoreProps) {
  const t = useTranslations('common');
  const { sentinelRef, messageKey, waitingEmoji } = useInfiniteLoadMore({
    hasMore,
    isLoading,
    onLoadMore,
  });

  const waitingMessage = t(`loadMoreWaitingMessages.${messageKey}`);

  if (!hasMore && !isLoading) {
    return null;
  }

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', pt: 2, pb: 1 }}>
      <Stack
        ref={sentinelRef}
        spacing={1.5}
        sx={{
          alignItems: 'center',
          width: '100%',
        }}
        aria-busy={isLoading}
        aria-live={isLoading ? 'polite' : undefined}
        aria-label={waitingMessage}
      >
        <Box
          aria-hidden
          sx={{
            fontSize: isLoading ? '2.1rem' : '1.85rem',
            lineHeight: 1,
            userSelect: 'none',
            transition: 'font-size 420ms cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes infiniteLoadMoreEmojiPulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.16)' },
            },
            animation: isLoading ? 'infiniteLoadMoreEmojiPulse 1.1s ease-in-out infinite' : 'none',
          }}
        >
          {waitingEmoji}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.55,
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 320,
            mx: 'auto',
            px: 1,
          }}
        >
          {waitingMessage}
        </Typography>
      </Stack>
    </Stack>
  );
}
