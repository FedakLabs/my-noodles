'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useEffect, useEffectEvent, useState } from 'react';

import { FeedCardSkeleton } from '@/components/feed/card/feed-card-skeleton';
import { feedReelItemSx, feedScreenSx } from '@/components/feed/feed-chrome';

export const FEED_CINEMA_TRANSITION_MS = 520;

type FeedCinemaTransitionProps = {
  active: boolean;
  onCovered: () => void;
};

export function FeedCinemaTransition({ active, onCovered }: FeedCinemaTransitionProps) {
  const theme = useTheme();
  const [entered, setEntered] = useState(false);
  const handleCovered = useEffectEvent(onCovered);

  useEffect(() => {
    if (!active) {
      setEntered(false);
      return;
    }

    const enterFrame = requestAnimationFrame(() => {
      setEntered(true);
    });

    const coverTimer = window.setTimeout(() => {
      handleCovered();
    }, FEED_CINEMA_TRANSITION_MS);

    return () => {
      cancelAnimationFrame(enterFrame);
      window.clearTimeout(coverTimer);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <Box
      aria-busy
      aria-live="polite"
      role="presentation"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal + 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...feedScreenSx,
        transform: entered ? 'translateX(0)' : 'translateX(100%)',
        transition: theme.transitions.create('transform', {
          duration: FEED_CINEMA_TRANSITION_MS,
          easing: theme.transitions.easing.easeInOut,
        }),
        pointerEvents: 'auto',
      }}
    >
      <Box sx={{ ...feedReelItemSx, height: '100%', maxHeight: '100dvh' }}>
        <FeedCardSkeleton />
      </Box>
    </Box>
  );
}
