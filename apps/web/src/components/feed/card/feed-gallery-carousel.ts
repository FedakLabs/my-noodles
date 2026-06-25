import { galleryCarouselOptions } from '@my-noodles/ui';

type FeedEmblaApi = {
  rootNode: () => HTMLElement;
};

function watchFeedGalleryDrag(emblaApi: FeedEmblaApi): boolean {
  const viewport = emblaApi.rootNode().closest('[data-feed-reel-viewport]');
  return viewport?.getAttribute('data-feed-axis-lock') !== 'vertical';
}

/** Feed reel: block carousel drag while the viewport is locked to vertical navigation. */
export const feedGalleryCarouselOptions = {
  ...galleryCarouselOptions,
  watchDrag: watchFeedGalleryDrag,
};
