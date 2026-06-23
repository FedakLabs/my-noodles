'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type useEmblaCarousel from 'embla-carousel-react';
import type { ReactNode } from 'react';

import { CarouselContext } from './carousel-context';
import { useCarouselState } from './use-carousel-state';

type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

export type CarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  options?: CarouselOptions;
  onSelect?: (index: number) => void;
  sx?: SxProps<Theme>;
};

export function Carousel({ children, ariaLabel, options, onSelect, sx }: CarouselProps) {
  const carousel = useCarouselState(options, onSelect);

  return (
    <CarouselContext.Provider value={carousel}>
      <Box
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        sx={{
          position: 'relative',
          width: '100%',
          ...sx,
        }}
      >
        {children}
      </Box>
    </CarouselContext.Provider>
  );
}
