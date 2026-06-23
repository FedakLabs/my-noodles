import type { GalleryImageInput, MediaGalleryImageItem } from './types';

export function galleryImages(images: GalleryImageInput[]): MediaGalleryImageItem[] {
  return images.map((image) => ({ type: 'image', ...image }));
}
