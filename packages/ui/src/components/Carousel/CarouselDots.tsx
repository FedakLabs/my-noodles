'use client';

import Box from '@mui/material/Box';

import { useCarouselContext } from './carousel-context';

export type CarouselDotsProps = {
  count: number;
  slideLabel: (index: number, total: number) => string;
};

export function CarouselDots({ count, slideLabel }: CarouselDotsProps) {
  const { selectedIndex, scrollTo } = useCarouselContext();

  if (count <= 1) {
    return null;
  }

  const dotSize = 8;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 10,
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={`carousel-dot-${index}`}
          component="button"
          type="button"
          aria-label={slideLabel(index + 1, count)}
          aria-current={selectedIndex === index ? 'true' : undefined}
          onClick={() => scrollTo(index)}
          sx={{
            pointerEvents: 'auto',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            border: 0,
            p: 0,
            cursor: 'pointer',
            bgcolor: selectedIndex === index ? 'primary.main' : 'action.disabledBackground',
            opacity: selectedIndex === index ? 1 : 0.85,
            transition: 'background-color 0.2s, opacity 0.2s',
          }}
        />
      ))}
    </Box>
  );
}
