'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';

import { useLikeFeedProduct, useUnlikeFeedProduct } from '@/api/feed';
import { ChevronIcon } from '@/components/feed/action-rail/feed-icons';
import { FeedCommentsPanel } from '@/components/feed/comments/feed-comments-panel';
import { FeedEmptyState } from '@/components/feed/end/feed-empty-state';
import {
  feedDesktopSplitRowSx,
  feedNavIconButtonSx,
  feedNavStackSx,
  feedReelStageSx,
  feedScreenSx,
} from '@/components/feed/feed-chrome';
import { FeedExitButton } from '@/components/feed/feed-exit-button';
import { FeedLikedList } from '@/components/feed/liked/feed-liked-list';
import { FeedReelViewport, type FeedReelViewportHandle } from '@/components/feed/reel/feed-reel-viewport';
import { FeedErrorState } from '@/components/feed/states/feed-error-state';
import { type FeedTagChip, flattenFeedTags, useFeedTagsStore } from '@/hooks/feed';

import { useFeedPager } from './use-feed-pager';
import { useFeedPanels } from './use-feed-panels';

export function FeedScreen() {
  const t = useTranslations('feed');
  const theme = useTheme();

  const filters = useFeedTagsStore((state) => state.filters);
  const labels = useFeedTagsStore((state) => state.labels);
  const addTag = useFeedTagsStore((state) => state.addTag);
  const removeTag = useFeedTagsStore((state) => state.removeTag);
  const clearTags = useFeedTagsStore((state) => state.clear);

  const pager = useFeedPager();
  const reelRef = useRef<FeedReelViewportHandle>(null);
  const {
    items,
    currentItem,
    index,
    initializing,
    isFetching,
    showSkeletonSlide,
    showEndSlide,
    exhausted,
    error,
    canGoNext,
    canGoPrevious,
    reshuffle,
    reshuffling,
    retry,
    setItemLiked,
  } = pager;

  const panels = useFeedPanels();

  const { likeFeed } = useLikeFeedProduct();
  const { unlikeFeed } = useUnlikeFeedProduct();

  const activeTags = flattenFeedTags(filters);

  useEffect(() => {
    panels.closeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close overlays when the visible reel changes
  }, [index, currentItem?.id]);

  const guardedNav = useCallback((direction: 'next' | 'previous') => {
    reelRef.current?.commitNav(direction);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        guardedNav('next');
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        guardedNav('previous');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        reelRef.current?.scrollMedia('next');
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        reelRef.current?.scrollMedia('previous');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [guardedNav]);

  const handleToggleLike = useCallback(() => {
    if (!currentItem) {
      return;
    }
    const nextLiked = !currentItem.liked;
    const productId = currentItem.id;
    setItemLiked(productId, nextLiked);

    const rollback = () => setItemLiked(productId, !nextLiked);
    if (nextLiked) {
      likeFeed(productId, { onError: rollback });
    } else {
      unlikeFeed(productId, { onError: rollback });
    }
  }, [currentItem, likeFeed, setItemLiked, unlikeFeed]);

  const handleRemoveTag = useCallback((chip: FeedTagChip) => removeTag(chip.type, chip.value), [removeTag]);

  const showReel = !error && (initializing || currentItem !== null || showSkeletonSlide || showEndSlide);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...feedScreenSx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FeedExitButton label={t('exit')} />

        {error ? (
          <FeedErrorState onRetry={retry} retrying={initializing || isFetching} />
        ) : showReel ? (
          <Box sx={feedDesktopSplitRowSx}>
            <Box sx={feedReelStageSx}>
              <FeedReelViewport
                ref={reelRef}
                items={items}
                index={index}
                exhausted={exhausted}
                showSkeletonSlide={showSkeletonSlide}
                showEndSlide={showEndSlide}
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                onNext={pager.goNext}
                onPrevious={pager.goPrevious}
                onAddTag={addTag}
                detailsOpen={panels.detailsOpen}
                onOpenDetails={panels.openDetails}
                onCloseDetails={panels.closeDetails}
                onToggleLike={handleToggleLike}
                commentsOpen={panels.commentsOpen}
                onOpenComments={panels.openComments}
                onOpenLiked={panels.openLiked}
                activeTags={activeTags}
                tagLabels={labels}
                onRemoveTag={handleRemoveTag}
                onClearTags={clearTags}
                onReshuffle={reshuffle}
                reshuffling={reshuffling}
              />

              <Stack spacing={1.5} sx={feedNavStackSx}>
                <IconButton
                  aria-label={t('previous')}
                  onClick={() => guardedNav('previous')}
                  disabled={!canGoPrevious}
                  sx={feedNavIconButtonSx(theme)}
                >
                  <ChevronIcon direction="up" />
                </IconButton>
                <IconButton
                  aria-label={t('next')}
                  onClick={() => guardedNav('next')}
                  disabled={!canGoNext}
                  sx={feedNavIconButtonSx(theme)}
                >
                  <ChevronIcon direction="down" />
                </IconButton>
              </Stack>
            </Box>

            <FeedCommentsPanel
              open={panels.commentsOpen}
              productId={currentItem?.id ?? null}
              onClose={panels.closeComments}
            />
          </Box>
        ) : (
          <FeedEmptyState
            activeTags={activeTags}
            tagLabels={labels}
            onRemoveTag={handleRemoveTag}
            onOpenSaved={panels.openLiked}
            onReshuffle={reshuffle}
            reshuffling={reshuffling}
          />
        )}
      </Box>

      <FeedLikedList
        open={panels.likedOpen}
        onClose={panels.closeLiked}
        onUnliked={(id) => setItemLiked(id, false)}
      />
    </Box>
  );
}
