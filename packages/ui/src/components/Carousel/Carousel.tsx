'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type useEmblaCarousel from 'embla-carousel-react';
import type { ReactNode } from 'react';

import { CarouselContext } from './carousel-context';
import { useCarouselState } from './use-carousel-state';
import { type CarouselStoryNavConfig, useCarouselStoryNav } from './use-carousel-story-nav';

type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

export type { CarouselStoryNavConfig };

export type CarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  options?: CarouselOptions;
  onSelect?: (index: number) => void;
  storyNav?: CarouselStoryNavConfig;
  sx?: SxProps<Theme>;
};

function CarouselRoot({
  children,
  ariaLabel,
  storyNav,
  sx,
}: {
  children: ReactNode;
  ariaLabel: string;
  storyNav?: CarouselStoryNavConfig;
  sx?: SxProps<Theme>;
}) {
  const storyNavHandlers = useCarouselStoryNav(storyNav);

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      {...storyNavHandlers}
      sx={{
        position: 'relative',
        width: '100%',
        ...(storyNav
          ? {
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }
          : undefined),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function Carousel({ children, ariaLabel, options, onSelect, storyNav, sx }: CarouselProps) {
  const carousel = useCarouselState(options, onSelect);

  return (
    <CarouselContext.Provider value={carousel}>
      <CarouselRoot ariaLabel={ariaLabel} storyNav={storyNav} sx={sx}>
        {children}
      </CarouselRoot>
    </CarouselContext.Provider>
  );
}
