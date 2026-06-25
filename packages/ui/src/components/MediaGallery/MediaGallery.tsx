'use client';

import Box from '@mui/material/Box';
import { lazy, Suspense, useCallback, useState } from 'react';

import { Carousel, CarouselContent, CarouselDots, CarouselSlide, galleryCarouselOptions } from '../Carousel';
import { MediaGalleryImage } from './MediaGalleryImage';
import { MediaGalleryPlaceholder } from './MediaGalleryPlaceholder';
import type { MediaGalleryVideoLabels } from './MediaGalleryVideo';
import type { MediaGalleryItem } from './types';

const MediaGalleryVideo = lazy(() =>
  import('./MediaGalleryVideo').then((module) => ({ default: module.MediaGalleryVideo })),
);

export type MediaGalleryLabels = {
  gallery: string;
  slide: (index: number, total: number) => string;
  video: MediaGalleryVideoLabels;
};

export type MediaGalleryProps = {
  items: MediaGalleryItem[];
  labels?: Partial<MediaGalleryLabels>;
};

const defaultLabels: MediaGalleryLabels = {
  gallery: 'Media gallery',
  slide: (index, total) => `Slide ${index + 1} of ${total}`,
  video: {
    play: 'Play video',
    pause: 'Pause video',
    mute: 'Mute video',
    unmute: 'Unmute video',
  },
};

function resolveLabels(labels?: Partial<MediaGalleryLabels>): MediaGalleryLabels {
  return {
    ...defaultLabels,
    ...labels,
    video: { ...defaultLabels.video, ...labels?.video },
  };
}

const videoFallbackSx = {
  width: '100%',
  height: '100%',
} as const;

export function MediaGallery({ items, labels }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedLabels = resolveLabels(labels);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  if (items.length === 0) {
    return (
      <Box
        sx={{
          aspectRatio: '1',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          flexShrink: 0,
        }}
      >
        <MediaGalleryPlaceholder />
      </Box>
    );
  }

  return (
    <Carousel
      ariaLabel={resolvedLabels.gallery}
      options={galleryCarouselOptions}
      onSelect={handleSelect}
      sx={{
        aspectRatio: '1',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: 'action.hover',
        flexShrink: 0,
      }}
    >
      <CarouselContent>
        {items.map((item, index) => {
          const slideContent =
            item.type === 'image' ? (
              <MediaGalleryImage url={item.url} alt={item.alt} viewTransitionName={item.viewTransitionName} />
            ) : (
              <Suspense fallback={<MediaGalleryPlaceholder sx={videoFallbackSx} />}>
                <MediaGalleryVideo
                  url={item.url}
                  alt={item.alt}
                  posterUrl={item.posterUrl}
                  isActive={activeIndex === index}
                  labels={resolvedLabels.video}
                />
              </Suspense>
            );

          return (
            <CarouselSlide
              key={`${item.type}-${item.url}-${index}`}
              index={index}
              slideLabel={resolvedLabels.slide(index + 1, items.length)}
            >
              {slideContent}
            </CarouselSlide>
          );
        })}
      </CarouselContent>

      <CarouselDots count={items.length} slideLabel={resolvedLabels.slide} />
    </Carousel>
  );
}
