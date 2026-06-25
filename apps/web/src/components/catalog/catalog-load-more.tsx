'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { useIntersectionObserver } from '@/hooks/intersection';
import { pickRandom } from '@/utils/pick-random';

const LOAD_MORE_MESSAGE_KEYS = ['sniff', 'crunch', 'shelf', 'unwrap', 'taste', 'hunt'] as const;

type LoadMoreMessageKey = (typeof LOAD_MORE_MESSAGE_KEYS)[number];

const LOAD_MORE_EMOJIS: Record<LoadMoreMessageKey, string> = {
  sniff: '👃',
  crunch: '🍿',
  shelf: '👀',
  unwrap: '🎁',
  taste: '😋',
  hunt: '🕵️',
};

const SENTINEL_ROOT_MARGIN = '160px 0px 0px';

type CatalogLoadMoreProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function CatalogLoadMore({ hasMore, isLoading, onLoadMore }: CatalogLoadMoreProps) {
  const t = useTranslations('catalog');
  const wasLoadingRef = useRef(false);
  const [messageKey, setMessageKey] = useState<LoadMoreMessageKey>(() => pickRandom(LOAD_MORE_MESSAGE_KEYS));

  const loaderRef = useIntersectionObserver<HTMLDivElement>({
    enabled: hasMore,
    when: !isLoading,
    onIntersect: onLoadMore,
    rootMargin: SENTINEL_ROOT_MARGIN,
  });

  const waitingMessage = t(`loadMoreWaitingMessages.${messageKey}`);
  const waitingEmoji = LOAD_MORE_EMOJIS[messageKey];

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      setMessageKey(pickRandom(LOAD_MORE_MESSAGE_KEYS));
    }

    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  if (!hasMore && !isLoading) {
    return null;
  }

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', pt: 2, pb: 1 }}>
      <Stack
        ref={loaderRef}
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
            '@keyframes catalogLoadMoreEmojiPulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.16)' },
            },
            animation: isLoading ? 'catalogLoadMoreEmojiPulse 1.1s ease-in-out infinite' : 'none',
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
