import type { MediaGalleryItem } from '@my-noodles/ui';

import type { FeedItemDto } from '@/api/feed';

/** Build MediaGallery items (images first, then videos) from a feed product. */
export function toFeedMediaItems(
  item: Pick<FeedItemDto, 'name' | 'slug' | 'images' | 'videos'>,
): MediaGalleryItem[] {
  const alt = item.name ?? item.slug;

  return [
    ...item.images.map((url) => ({ type: 'image' as const, url, alt })),
    ...item.videos.map((url) => ({ type: 'video' as const, url, alt })),
  ];
}
