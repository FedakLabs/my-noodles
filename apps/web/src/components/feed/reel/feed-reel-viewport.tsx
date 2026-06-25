'use client';

import Box from '@mui/material/Box';
import type { MediaGalleryHandle } from '@my-noodles/ui';
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { FeedItemDto } from '@/api/feed';
import { FeedActionRail } from '@/components/feed/action-rail/feed-action-rail';
import { FeedCard } from '@/components/feed/card/feed-card';
import { FeedCardSkeleton } from '@/components/feed/card/feed-card-skeleton';
import { FeedEndCard } from '@/components/feed/end/feed-end-card';
import type { FeedTagChip } from '@/hooks/feed';

import { type FeedSwipeDirection, useFeedSwipe } from './use-feed-swipe';

const reelCardSx = {
  position: 'relative',
  height: { xs: '100dvh', sm: 'min(calc(100dvh - 40px), 880px)' },
  width: { xs: '100vw', sm: 'auto' },
  aspectRatio: { sm: '9 / 16' },
  maxWidth: { sm: 480 },
} as const;

const slideLayerSx = {
  position: 'absolute',
  inset: 0,
  height: '100%',
  willChange: 'transform',
} as const;

export type FeedReelViewportHandle = {
  commitNav: (direction: FeedSwipeDirection) => void;
  scrollMedia: (direction: 'previous' | 'next') => void;
};

type FeedReelViewportProps = {
  items: FeedItemDto[];
  index: number;
  exhausted: boolean;
  showSkeletonSlide: boolean;
  showEndSlide: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onAddTag: (type: FeedTagChip['type'], value: string, label: string) => void;
  detailsOpen: boolean;
  onOpenDetails: () => void;
  onCloseDetails: () => void;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onOpenLiked: () => void;
  activeTags: FeedTagChip[];
  tagLabels: Record<string, string>;
  onRemoveTag: (chip: FeedTagChip) => void;
  onClearTags: () => void;
  onReshuffle: () => void;
  reshuffling: boolean;
};

export const FeedReelViewport = forwardRef<FeedReelViewportHandle, FeedReelViewportProps>(
  function FeedReelViewport(
    {
      items,
      index,
      exhausted,
      showSkeletonSlide,
      showEndSlide,
      canGoNext,
      canGoPrevious,
      onNext,
      onPrevious,
      onAddTag,
      detailsOpen,
      onOpenDetails,
      onCloseDetails,
      onToggleLike,
      onOpenComments,
      onOpenLiked,
      activeTags,
      tagLabels,
      onRemoveTag,
      onClearTags,
      onReshuffle,
      reshuffling,
    },
    ref,
  ) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const mediaGalleryRef = useRef<MediaGalleryHandle>(null);
    const [slideHeight, setSlideHeight] = useState(0);

    const currentItem = index < items.length ? (items[index] ?? null) : null;
    const showingSkeleton = showSkeletonSlide && !currentItem && !showEndSlide;
    const nextItem = index < items.length - 1 ? (items[index + 1] ?? null) : null;
    const showNextSkeleton = !nextItem && index === items.length - 1 && !exhausted;
    const showNextEnd = !nextItem && index === items.length - 1 && exhausted;
    const prevItem = index > 0 ? (items[index - 1] ?? null) : null;

    useLayoutEffect(() => {
      const node = viewportRef.current;
      if (!node) {
        return;
      }

      const updateHeight = () => setSlideHeight(node.clientHeight);
      updateHeight();

      const observer = new ResizeObserver(updateHeight);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const swipe = useFeedSwipe({
      containerRef: viewportRef,
      slideHeight,
      canGoNext,
      canGoPrevious,
      onNext,
      onPrevious,
    });

    useImperativeHandle(
      ref,
      () => ({
        commitNav: swipe.commitNav,
        scrollMedia: (direction) => {
          if (direction === 'next') {
            mediaGalleryRef.current?.scrollNext();
            return;
          }
          mediaGalleryRef.current?.scrollPrevious();
        },
      }),
      [swipe.commitNav],
    );

    const layerTransition = { transition: swipe.transition };
    const onLayerTransitionEnd = swipe.handleTransitionEnd;

    return (
      <Box sx={reelCardSx}>
        <Box
          ref={viewportRef}
          data-feed-reel-viewport
          sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: 'inherit',
            touchAction: 'none',
            cursor: swipe.isDragging ? 'grabbing' : 'grab',
          }}
          {...swipe.pointerHandlers}
        >
          {swipe.showPrevLayer && prevItem ? (
            <Box
              onTransitionEnd={onLayerTransitionEnd}
              sx={{
                ...slideLayerSx,
                transform: swipe.layerTransform.previous,
                ...layerTransition,
                zIndex: 1,
              }}
            >
              <FeedCard
                key={`prev-${prevItem.id}`}
                item={prevItem}
                onAddTag={onAddTag}
                detailsOpen={false}
                onOpenDetails={onOpenDetails}
                onCloseDetails={onCloseDetails}
              />
            </Box>
          ) : null}

          {swipe.showNextLayer && (nextItem || showNextSkeleton || showNextEnd) ? (
            <Box
              onTransitionEnd={onLayerTransitionEnd}
              sx={{
                ...slideLayerSx,
                transform: swipe.layerTransform.next,
                ...layerTransition,
                zIndex: 1,
              }}
            >
              {nextItem ? (
                <FeedCard
                  key={`next-${nextItem.id}`}
                  item={nextItem}
                  onAddTag={onAddTag}
                  detailsOpen={false}
                  onOpenDetails={onOpenDetails}
                  onCloseDetails={onCloseDetails}
                />
              ) : showNextEnd ? (
                <FeedEndCard
                  activeTags={activeTags}
                  tagLabels={tagLabels}
                  onRemoveTag={onRemoveTag}
                  onReshuffle={onReshuffle}
                  reshuffling={reshuffling}
                />
              ) : (
                <FeedCardSkeleton />
              )}
            </Box>
          ) : null}

          <Box
            onTransitionEnd={onLayerTransitionEnd}
            sx={{
              ...slideLayerSx,
              transform: swipe.layerTransform.current,
              ...layerTransition,
              zIndex: 2,
            }}
          >
            {showingSkeleton ? (
              <FeedCardSkeleton />
            ) : showEndSlide ? (
              <FeedEndCard
                activeTags={activeTags}
                tagLabels={tagLabels}
                onRemoveTag={onRemoveTag}
                onReshuffle={onReshuffle}
                reshuffling={reshuffling}
              />
            ) : currentItem ? (
              <FeedCard
                key={currentItem.id}
                item={currentItem}
                onAddTag={onAddTag}
                detailsOpen={detailsOpen}
                onOpenDetails={onOpenDetails}
                onCloseDetails={onCloseDetails}
                mediaGalleryRef={mediaGalleryRef}
              />
            ) : null}
          </Box>
        </Box>

        {currentItem ? (
          <FeedActionRail
            item={currentItem}
            onToggleLike={onToggleLike}
            onOpenComments={onOpenComments}
            onOpenLiked={onOpenLiked}
            activeTags={activeTags}
            tagLabels={tagLabels}
            onRemoveTag={onRemoveTag}
            onClearTags={onClearTags}
          />
        ) : null}
      </Box>
    );
  },
);
