export type MediaGalleryImageItem = {
  type: 'image';
  url: string;
  alt: string;
  viewTransitionName?: string;
};

export type MediaGalleryVideoItem = {
  type: 'video';
  url: string;
  alt: string;
  posterUrl?: string;
};

export type MediaGalleryItem = MediaGalleryImageItem | MediaGalleryVideoItem;

export type GalleryImageInput = Omit<MediaGalleryImageItem, 'type'>;
