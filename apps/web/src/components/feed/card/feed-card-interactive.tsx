'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { PointerEvent, ReactNode } from 'react';

type FeedCardInteractiveProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

/** Chrome control island — captures pointer events; reel/carousel gestures pass through elsewhere. */
export function FeedCardInteractive({ children, sx }: FeedCardInteractiveProps) {
  const stopPointer = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <Box
      data-feed-no-swipe
      onPointerDown={stopPointer}
      onPointerUp={stopPointer}
      sx={{ pointerEvents: 'auto', ...sx }}
    >
      {children}
    </Box>
  );
}
