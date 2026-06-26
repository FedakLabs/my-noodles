'use client';

import Box from '@mui/material/Box';

import { useCarouselContext } from './carousel-context';

export type CarouselProgressSegmentsProps = {
  count: number;
  slideLabel: (index: number, total: number) => string;
};

export function CarouselProgressSegments({ count, slideLabel }: CarouselProgressSegmentsProps) {
  const { selectedIndex, scrollTo } = useCarouselContext();

  if (count <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 12,
        right: 12,
        display: 'flex',
        gap: 0.375,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {Array.from({ length: count }, (_, index) => {
        const viewed = index <= selectedIndex;

        return (
          <Box
            key={`carousel-segment-${index}`}
            component="button"
            type="button"
            aria-label={slideLabel(index + 1, count)}
            aria-current={selectedIndex === index ? 'true' : undefined}
            onClick={() => scrollTo(index)}
            sx={{
              pointerEvents: 'auto',
              flex: 1,
              height: 2.5,
              borderRadius: 999,
              border: 0,
              p: 0,
              cursor: 'pointer',
              bgcolor: viewed ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.32)',
              transition: 'background-color 0.2s ease',
            }}
          />
        );
      })}
    </Box>
  );
}
