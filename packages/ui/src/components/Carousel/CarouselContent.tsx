'use client';

import Box from '@mui/material/Box';
import type { CSSProperties, ReactNode } from 'react';

import { useCarouselContext } from './carousel-context';

export type CarouselContentProps = {
  children: ReactNode;
  /** Theme spacing multiplier between slides (e.g. 2 → 16px at default spacing). */
  gap?: number;
  touchAction?: CSSProperties['touchAction'];
};

export function CarouselContent({ children, gap, touchAction = 'pan-y pinch-zoom' }: CarouselContentProps) {
  const { emblaRef } = useCarouselContext();

  return (
    <Box ref={emblaRef} sx={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          touchAction,
          ...(gap !== undefined ? { gap } : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
