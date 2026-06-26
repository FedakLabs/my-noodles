import { galleryCarouselOptions, type MediaGalleryProps } from '@my-noodles/ui';

function isFeedGalleryDragBlocked(event: MouseEvent | TouchEvent): boolean {
  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const viewport = target.closest('[data-feed-reel-viewport]');
  if (!(viewport instanceof HTMLElement)) {
    return false;
  }

  if (viewport.getAttribute('data-feed-axis-lock') === 'vertical') {
    return true;
  }

  return viewport.hasAttribute('data-feed-pointer-tracking');
}

/** Feed reel owns pointer gestures — Embla drag would bypass axis lock via document listeners. */
export const feedGalleryCarouselOptions: NonNullable<MediaGalleryProps['carouselOptions']> = {
  ...galleryCarouselOptions,
  watchDrag: (_emblaApi, event) => !isFeedGalleryDragBlocked(event),
};
