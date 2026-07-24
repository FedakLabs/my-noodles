'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { MediaGalleryHandle } from '@my-noodles/ui';
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { Product } from '@/api/feed';
import { FeedActionRail, type FeedCardControlsProps } from '@/components/feed/action-rail/feed-action-rail';
import { FeedCard } from '@/components/feed/card/feed-card';
import { FeedCardSkeleton } from '@/components/feed/card/feed-card-skeleton';
import { FeedEndCard } from '@/components/feed/end/feed-end-card';
import { feedOutsideRailSx, feedReelItemSx, feedReelViewportGestureSx } from '@/components/feed/feed-chrome';
import type { FeedTagChip } from '@/hooks/feed';

import { type FeedSwipeDirection, useFeedSwipe } from './use-feed-swipe';

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
  items: Product[];
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
  commentsOpen: boolean;
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
      commentsOpen,
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
    const theme = useTheme();
    const isWideFeed = useMediaQuery(theme.breakpoints.up('sm'));
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
      onHorizontalCommit: (direction) => {
        if (direction === 'next') {
          mediaGalleryRef.current?.scrollNext();
          return;
        }
        mediaGalleryRef.current?.scrollPrevious();
      },
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

    const cardControls: FeedCardControlsProps = {
      onToggleLike,
      commentsOpen,
      onOpenComments,
      onOpenLiked,
      activeTags,
      tagLabels,
      onRemoveTag,
      onClearTags,
    };

    const showOutsideRail = isWideFeed && currentItem != null && !detailsOpen;

    return (
      <Box sx={feedReelItemSx}>
        <Box
          ref={viewportRef}
          data-feed-reel-viewport
          sx={{
            position: 'absolute',
            inset: 0,
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
            borderRadius: 'inherit',
            ...feedReelViewportGestureSx,
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
                onRemoveTag={onRemoveTag}
                activeTags={activeTags}
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
                  onRemoveTag={onRemoveTag}
                  activeTags={activeTags}
                  detailsOpen={false}
                  onOpenDetails={onOpenDetails}
                  onCloseDetails={onCloseDetails}
                />
              ) : showNextEnd ? (
                <FeedEndCard
                  activeTags={activeTags}
                  tagLabels={tagLabels}
                  onRemoveTag={onRemoveTag}
                  onOpenSaved={onOpenLiked}
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
                onOpenSaved={onOpenLiked}
                onReshuffle={onReshuffle}
                reshuffling={reshuffling}
              />
            ) : currentItem ? (
              <FeedCard
                key={currentItem.id}
                item={currentItem}
                onAddTag={onAddTag}
                onRemoveTag={onRemoveTag}
                activeTags={activeTags}
                detailsOpen={detailsOpen}
                onOpenDetails={onOpenDetails}
                onCloseDetails={onCloseDetails}
                mediaGalleryRef={mediaGalleryRef}
                controls={cardControls}
              />
            ) : null}
          </Box>
        </Box>

        {showOutsideRail ? (
          <Box sx={feedOutsideRailSx}>
            <FeedActionRail item={currentItem} {...cardControls} />
          </Box>
        ) : null}
      </Box>
    );
  },
);
