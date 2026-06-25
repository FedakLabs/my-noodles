'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { iconStyle } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef } from 'react';

import { useLikeFeedProduct, useUnlikeFeedProduct } from '@/api/feed';
import { ChevronIcon } from '@/components/feed/action-rail/feed-icons';
import { FeedCommentsPanel } from '@/components/feed/comments/feed-comments-panel';
import { FeedEmptyState } from '@/components/feed/end/feed-empty-state';
import { feedGlassIconButtonSx, feedNavIconButtonSx, feedScreenSx } from '@/components/feed/feed-chrome';
import { FeedLikedList } from '@/components/feed/liked/feed-liked-list';
import { FeedReelViewport, type FeedReelViewportHandle } from '@/components/feed/reel/feed-reel-viewport';
import { FeedErrorState } from '@/components/feed/states/feed-error-state';
import { type FeedTagChip, flattenFeedTags, useFeedTagsStore } from '@/hooks/feed';
import { useRouter } from '@/i18n/navigation';

import { useFeedPager } from './use-feed-pager';
import { useFeedPanels } from './use-feed-panels';

export function FeedScreen() {
  const t = useTranslations('feed');
  const theme = useTheme();
  const router = useRouter();

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

  const { likeFeedAsync } = useLikeFeedProduct();
  const { unlikeFeedAsync } = useUnlikeFeedProduct();

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
      } else if (event.key === 'Escape') {
        router.push('/catalog');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [guardedNav, router]);

  const handleToggleLike = useCallback(() => {
    if (!currentItem) {
      return;
    }
    const nextLiked = !currentItem.liked;
    const productId = currentItem.id;
    setItemLiked(productId, nextLiked);

    const action = nextLiked ? likeFeedAsync : unlikeFeedAsync;
    void action(productId).catch(() => setItemLiked(productId, !nextLiked));
  }, [currentItem, likeFeedAsync, setItemLiked, unlikeFeedAsync]);

  const handleRemoveTag = useCallback((chip: FeedTagChip) => removeTag(chip.type, chip.value), [removeTag]);

  const showReel = !error && (initializing || currentItem !== null || showSkeletonSlide || showEndSlide);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (muiTheme) => muiTheme.zIndex.drawer,
        display: 'flex',
        ...feedScreenSx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton
          aria-label={t('exit')}
          onClick={() => router.push('/catalog')}
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 20 },
            left: { xs: 12, sm: 20 },
            zIndex: 5,
            ...feedGlassIconButtonSx(theme),
          }}
        >
          <CloseIcon aria-hidden style={iconStyle({ size: 26, color: 'inherit' })} />
        </IconButton>

        {error ? (
          <FeedErrorState onRetry={retry} retrying={initializing || isFetching} />
        ) : showReel ? (
          <>
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
              onOpenComments={panels.openComments}
              onOpenLiked={panels.openLiked}
              activeTags={activeTags}
              tagLabels={labels}
              onRemoveTag={handleRemoveTag}
              onClearTags={clearTags}
              onReshuffle={reshuffle}
              reshuffling={reshuffling}
            />

            <Stack
              spacing={1.5}
              sx={{
                position: 'absolute',
                right: { xs: 8, sm: 24 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 4,
                display: { xs: 'none', sm: 'flex' },
              }}
            >
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
          </>
        ) : (
          <FeedEmptyState
            activeTags={activeTags}
            tagLabels={labels}
            onRemoveTag={handleRemoveTag}
            onReshuffle={reshuffle}
            reshuffling={reshuffling}
          />
        )}
      </Box>

      <FeedCommentsPanel
        open={panels.commentsOpen}
        productId={currentItem?.id ?? null}
        onClose={panels.closeComments}
      />
      <FeedLikedList
        open={panels.likedOpen}
        onClose={panels.closeLiked}
        onUnliked={(id) => setItemLiked(id, false)}
      />
    </Box>
  );
}
