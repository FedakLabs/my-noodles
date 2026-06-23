'use client';

import type { EmblaViewportRefType, UseEmblaCarouselType } from 'embla-carousel-react';
import { createContext, useContext } from 'react';

export type CarouselContextValue = {
  emblaRef: EmblaViewportRefType;
  emblaApi: UseEmblaCarouselType[1];
  selectedIndex: number;
  scrollTo: (index: number) => void;
};

export const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarouselContext(): CarouselContextValue {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('Carousel compound components must be used within Carousel');
  }

  return context;
}
