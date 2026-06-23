'use client';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useBusyAreaState, usePrefersReducedMotion } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

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
const LOADER_SCROLL_MARGIN_BOTTOM = 16;

function isLoaderFullyVisible(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect();
  const viewportBottom = window.innerHeight;

  return rect.top >= 0 && rect.bottom <= viewportBottom - LOADER_SCROLL_MARGIN_BOTTOM;
}

type CatalogLoadMoreProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function CatalogLoadMore({ hasMore, isLoading, onLoadMore }: CatalogLoadMoreProps) {
  const t = useTranslations('catalog');
  const prefersReducedMotion = usePrefersReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const didScrollToLoaderRef = useRef(false);
  const [messageKey, setMessageKey] = useState<LoadMoreMessageKey>(() => pickRandom(LOAD_MORE_MESSAGE_KEYS));
  const { active: showPlayfulState } = useBusyAreaState(isLoading);

  const waitingMessage = t(`loadMoreWaitingMessages.${messageKey}`);
  const waitingEmoji = LOAD_MORE_EMOJIS[messageKey];

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setMessageKey(pickRandom(LOAD_MORE_MESSAGE_KEYS));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoading]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: SENTINEL_ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    if (!isLoading) {
      didScrollToLoaderRef.current = false;
    }
  }, [isLoading]);

  const scrollLoaderIntoView = () => {
    const node = loaderRef.current;
    if (!node || !isLoading || didScrollToLoaderRef.current) {
      return;
    }

    if (isLoaderFullyVisible(node)) {
      return;
    }

    didScrollToLoaderRef.current = true;
    node.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'end',
    });
  };

  if (!hasMore && !isLoading) {
    return null;
  }

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', pt: 2, pb: 1 }}>
      <Box
        ref={sentinelRef}
        aria-hidden
        sx={{
          width: '100%',
          height: 1,
          pointerEvents: 'none',
        }}
      />

      {isLoading ? (
        <Stack
          ref={loaderRef}
          spacing={1.5}
          sx={{
            alignItems: 'center',
            width: '100%',
            scrollMarginBottom: LOADER_SCROLL_MARGIN_BOTTOM,
          }}
          aria-busy
          aria-live="polite"
          aria-label={waitingMessage}
        >
          <Box
            aria-hidden
            sx={{
              fontSize: showPlayfulState ? '2.35rem' : '1.85rem',
              lineHeight: 1,
              userSelect: 'none',
              transition: prefersReducedMotion ? undefined : 'font-size 420ms cubic-bezier(0.22, 1, 0.36, 1)',
              ...(prefersReducedMotion
                ? {}
                : {
                    '@keyframes catalogLoadMoreEmojiPulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.16)' },
                    },
                    animation: showPlayfulState
                      ? 'catalogLoadMoreEmojiPulse 0.95s ease-in-out infinite'
                      : 'catalogLoadMoreEmojiPulse 1.35s ease-in-out infinite',
                  }),
            }}
          >
            {waitingEmoji}
          </Box>

          <Collapse
            in={showPlayfulState}
            unmountOnExit
            onEntered={scrollLoaderIntoView}
            sx={{ width: '100%' }}
          >
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
          </Collapse>
        </Stack>
      ) : null}
    </Stack>
  );
}
