'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { type FeedItemDto, fetchFeedNext } from '@/api/feed';
import { type FeedFilters, useFeedTagsStore } from '@/hooks/feed';

function getFeedFilters(): FeedFilters {
  return useFeedTagsStore.getState().filters;
}

function clearFeedTags(): void {
  useFeedTagsStore.getState().clear();
}

export type FeedPager = {
  items: FeedItemDto[];
  currentItem: FeedItemDto | null;
  index: number;
  count: number;
  initializing: boolean;
  isFetching: boolean;
  showSkeletonSlide: boolean;
  showEndSlide: boolean;
  exhausted: boolean;
  error: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goNext: () => void;
  goPrevious: () => void;
  reshuffle: () => void;
  reshuffling: boolean;
  retry: () => void;
  setItemLiked: (productId: string, liked: boolean) => void;
};

const NAV_LOCK_MS = 500;

/**
 * Client-side pager buffer: back/forward within loaded items is in-memory (no request).
 * `POST /feed/next` fires only when advancing past the buffer end, carrying the just-left
 * product's dwell. Changing filters resets the buffer and refetches from scratch.
 *
 * Calls `fetchFeedNext` directly (not React Query) so every advance hits the network with
 * the current `previousProduct` — no mutation `data` reuse or query-key staleness.
 */
export function useFeedPager(): FeedPager {
  const filters = useFeedTagsStore((state) => state.filters);

  const [items, setItems] = useState<FeedItemDto[]>([]);
  const [index, setIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reshuffling, setReshuffling] = useState(false);
  const [error, setError] = useState(false);

  const activeSinceRef = useRef<number | null>(null);
  const navLockRef = useRef(0);
  const fetchGenerationRef = useRef(0);
  /** Reshuffle/retry clear tags synchronously; skip the filter-change reload they would trigger. */
  const skipFilterReloadRef = useRef(false);

  const markActive = useCallback(() => {
    activeSinceRef.current = Date.now();
  }, []);

  const dwellSince = useCallback((from: number | null) => {
    const start = from ?? Date.now();
    return Math.max(0, Date.now() - start);
  }, []);

  const loadNext = useCallback(
    async (leavingItem: FeedItemDto, generation: number, rollbackIndex: number) => {
      setLoading(true);
      setError(false);

      try {
        const response = await fetchFeedNext({
          previousProduct: {
            id: leavingItem.id,
            viewTime: dwellSince(activeSinceRef.current),
          },
          filters: getFeedFilters(),
        });

        if (generation !== fetchGenerationRef.current) {
          return;
        }

        if (response.item) {
          const nextItem = response.item;
          setItems((prev) => [...prev, nextItem]);
          setExhausted(false);
          markActive();
        } else {
          setExhausted(true);
        }
      } catch {
        if (generation !== fetchGenerationRef.current) {
          return;
        }
        setIndex(rollbackIndex);
        setError(true);
      } finally {
        if (generation === fetchGenerationRef.current) {
          setLoading(false);
        }
      }
    },
    [dwellSince, markActive],
  );

  const reloadFromScratch = useCallback(() => {
    const generation = ++fetchGenerationRef.current;
    let cancelled = false;

    setInitializing(true);
    setLoading(true);
    setError(false);
    setItems([]);
    setIndex(0);
    setExhausted(false);

    void (async () => {
      try {
        const response = await fetchFeedNext({ filters: getFeedFilters() });
        if (cancelled || generation !== fetchGenerationRef.current) {
          return;
        }
        setItems(response.item ? [response.item] : []);
        setExhausted(!response.item);
        activeSinceRef.current = Date.now();
      } catch {
        if (cancelled || generation !== fetchGenerationRef.current) {
          return;
        }
        setError(true);
      } finally {
        if (!cancelled && generation === fetchGenerationRef.current) {
          setInitializing(false);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    if (skipFilterReloadRef.current) {
      skipFilterReloadRef.current = false;
      return;
    }
    // Filter changes must reset the in-memory pager before fetching the next item.

    return reloadFromScratch();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- keyed by serialized filters only
  }, [filtersKey]);

  const goNext = useCallback(() => {
    const now = Date.now();
    if (now - navLockRef.current < NAV_LOCK_MS || loading || index >= items.length) {
      return;
    }

    if (index < items.length - 1) {
      navLockRef.current = now;
      setIndex((prev) => prev + 1);
      markActive();
      return;
    }

    if (exhausted) {
      navLockRef.current = now;
      setIndex(items.length);
      markActive();
      return;
    }

    const leavingItem = items[index];
    if (!leavingItem) {
      return;
    }

    const rollbackIndex = index;
    navLockRef.current = now;
    setIndex(items.length);
    void loadNext(leavingItem, fetchGenerationRef.current, rollbackIndex);
  }, [exhausted, index, items, loadNext, loading, markActive]);

  const goPrevious = useCallback(() => {
    const now = Date.now();
    if (now - navLockRef.current < NAV_LOCK_MS || index <= 0 || loading) {
      return;
    }
    navLockRef.current = now;
    setIndex((prev) => prev - 1);
    markActive();
  }, [index, loading, markActive]);

  const setItemLiked = useCallback((productId: string, liked: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, liked } : item)));
  }, []);

  const reshuffle = useCallback(() => {
    skipFilterReloadRef.current = true;
    clearFeedTags();

    const generation = ++fetchGenerationRef.current;
    setReshuffling(true);
    setLoading(true);
    setExhausted(false);
    setError(false);

    void (async () => {
      try {
        const response = await fetchFeedNext({ filters: getFeedFilters(), reshuffle: true });

        if (generation !== fetchGenerationRef.current) {
          return;
        }

        setItems(response.item ? [response.item] : []);
        setExhausted(!response.item);
        setIndex(0);
        markActive();
      } catch {
        if (generation !== fetchGenerationRef.current) {
          return;
        }
        setError(true);
      } finally {
        if (generation === fetchGenerationRef.current) {
          setReshuffling(false);
          setLoading(false);
        }
      }
    })();
  }, [markActive]);

  const retry = useCallback(() => {
    skipFilterReloadRef.current = true;
    clearFeedTags();
    reloadFromScratch();
  }, [reloadFromScratch]);

  const showSkeletonSlide =
    !error && ((initializing && items.length === 0) || (loading && index >= items.length && !exhausted));

  const showEndSlide = !error && exhausted && items.length > 0 && index === items.length;
  const currentItem = !error && index < items.length ? (items[index] ?? null) : null;
  const canGoNext = !error && !loading && !reshuffling && items.length > 0 && index <= items.length - 1;
  const canGoPrevious = !error && index > 0 && !loading && !reshuffling;

  return {
    items,
    currentItem,
    index,
    count: items.length,
    initializing,
    isFetching: loading,
    showSkeletonSlide,
    showEndSlide,
    exhausted,
    error,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    reshuffle,
    reshuffling,
    retry,
    setItemLiked,
  };
}
