'use client';

import Box from '@mui/material/Box';
import type useEmblaCarousel from 'embla-carousel-react';
import type { CSSProperties } from 'react';
import { lazy, type Ref, Suspense, useCallback, useImperativeHandle, useState } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselProgressSegments,
  CarouselSlide,
  galleryCarouselOptions,
} from '../Carousel';
import { useCarouselContext } from '../Carousel/carousel-context';
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
  previousSlide: string;
  nextSlide: string;
  video: MediaGalleryVideoLabels;
};

type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

export type MediaGalleryHandle = {
  scrollPrevious: () => void;
  scrollNext: () => void;
};

export type MediaGalleryProps = {
  items: MediaGalleryItem[];
  labels?: Partial<MediaGalleryLabels>;
  /** Fill the parent's height (e.g. a vertical reel card) instead of the default square frame. */
  fill?: boolean;
  carouselOptions?: CarouselOptions;
  /** Touch-action on the slide track — feed reels use `pan-x` so vertical swipes stay on the reel. */
  slideTouchAction?: CSSProperties['touchAction'];
  /** Stories-style progress bars — `top` hides dot pagination. */
  progressSegments?: 'top';
  /** Imperative control for keyboard / programmatic slide changes. */
  mediaRef?: Ref<MediaGalleryHandle>;
};

const defaultLabels: MediaGalleryLabels = {
  gallery: 'Media gallery',
  slide: (index, total) => `Slide ${index + 1} of ${total}`,
  previousSlide: 'Previous slide',
  nextSlide: 'Next slide',
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

function MediaGalleryControls({ mediaRef }: { mediaRef?: Ref<MediaGalleryHandle> }) {
  const { emblaApi } = useCarouselContext();

  useImperativeHandle(
    mediaRef,
    () => ({
      scrollPrevious: () => {
        emblaApi?.scrollPrev();
      },
      scrollNext: () => {
        emblaApi?.scrollNext();
      },
    }),
    [emblaApi],
  );

  return null;
}

export function MediaGallery({
  items,
  labels,
  fill = false,
  carouselOptions,
  slideTouchAction,
  progressSegments,
  mediaRef,
}: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedLabels = resolveLabels(labels);
  const resolvedCarouselOptions = carouselOptions ?? galleryCarouselOptions;

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const frameSx = {
    borderRadius: fill ? 0 : 1.5,
    overflow: 'hidden',
    bgcolor: 'action.hover',
    flexShrink: 0,
    ...(fill ? { height: '100%' } : { aspectRatio: '1' }),
  } as const;

  if (items.length === 0) {
    return (
      <Box sx={frameSx}>
        <MediaGalleryPlaceholder />
      </Box>
    );
  }

  return (
    <Carousel
      ariaLabel={resolvedLabels.gallery}
      options={resolvedCarouselOptions}
      onSelect={handleSelect}
      storyNav={
        progressSegments === 'top'
          ? {
              count: items.length,
              previousLabel: resolvedLabels.previousSlide,
              nextLabel: resolvedLabels.nextSlide,
            }
          : undefined
      }
      sx={frameSx}
    >
      <MediaGalleryControls mediaRef={mediaRef} />
      <CarouselContent touchAction={slideTouchAction}>
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

      {progressSegments === 'top' ? (
        <CarouselProgressSegments count={items.length} slideLabel={resolvedLabels.slide} />
      ) : (
        <CarouselDots count={items.length} slideLabel={resolvedLabels.slide} />
      )}
    </Carousel>
  );
}
