'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import type { CarouselContextValue } from './carousel-context';

type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

export function useCarouselState(
  options?: CarouselOptions,
  onSelect?: (index: number) => void,
): Pick<CarouselContextValue, 'emblaRef' | 'emblaApi' | 'selectedIndex' | 'scrollTo'> {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onSelect?.(index);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    handleSelect();
    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', handleSelect);

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', handleSelect);
    };
  }, [emblaApi, handleSelect]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  return { emblaRef, emblaApi, selectedIndex, scrollTo };
}
