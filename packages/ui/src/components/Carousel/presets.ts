import type useEmblaCarousel from 'embla-carousel-react';

type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

/** Full-width slides — product photo / media gallery. */
export const galleryCarouselOptions = {
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: false,
} satisfies CarouselOptions;

/** Partial-width slides — horizontal product rails. */
export const railCarouselOptions = {
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: false,
} satisfies CarouselOptions;
