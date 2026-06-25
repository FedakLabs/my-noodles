import type { GalleryImageInput, MediaGalleryImageItem, MediaGalleryItem } from './types';

export function galleryImages(images: GalleryImageInput[]): MediaGalleryImageItem[] {
  return images.map((image) => ({ type: 'image', ...image }));
}

/** First image in the list, else first video, else null — pair with `MediaGalleryPlaceholder`. */
export function resolvePrimaryMediaItem(items: MediaGalleryItem[]): MediaGalleryItem | null {
  const firstImage = items.find((item) => item.type === 'image');
  if (firstImage) {
    return firstImage;
  }

  const firstVideo = items.find((item) => item.type === 'video');
  if (firstVideo) {
    return firstVideo;
  }

  return null;
}
