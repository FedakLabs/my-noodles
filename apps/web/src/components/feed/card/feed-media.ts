import type { MediaGalleryItem } from '@my-noodles/ui';

import type { Product } from '@/api/feed';

export function toFeedMediaItems(
  item: Pick<Product, 'name' | 'slug' | 'images' | 'videos'>,
): MediaGalleryItem[] {
  const alt = item.name ?? item.slug;

  return [
    ...item.images.map((url) => ({ type: 'image' as const, url, alt })),
    ...item.videos.map((url) => ({ type: 'video' as const, url, alt })),
  ];
}
