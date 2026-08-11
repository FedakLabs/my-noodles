'use client';

import { useEffect, useRef, useState } from 'react';

import { useIntersectionObserver } from '@/hooks/intersection';
import { pickRandom } from '@/utils/pick-random';

export const INFINITE_LOAD_MORE_MESSAGE_KEYS = [
  'sniff',
  'crunch',
  'shelf',
  'unwrap',
  'taste',
  'hunt',
] as const;

export type InfiniteLoadMoreMessageKey = (typeof INFINITE_LOAD_MORE_MESSAGE_KEYS)[number];

export const INFINITE_LOAD_MORE_EMOJIS: Record<InfiniteLoadMoreMessageKey, string> = {
  sniff: '👃',
  crunch: '🍿',
  shelf: '👀',
  unwrap: '🎁',
  taste: '😋',
  hunt: '🕵️',
};

const SENTINEL_ROOT_MARGIN = '160px 0px 0px';

type UseInfiniteLoadMoreOptions = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function useInfiniteLoadMore({ hasMore, isLoading, onLoadMore }: UseInfiniteLoadMoreOptions) {
  const wasLoadingRef = useRef(false);
  // Stable SSR/client default — randomize only after mount to avoid hydration mismatches.
  const [messageKey, setMessageKey] = useState<InfiniteLoadMoreMessageKey>(
    INFINITE_LOAD_MORE_MESSAGE_KEYS[0],
  );

  const sentinelRef = useIntersectionObserver<HTMLDivElement>({
    enabled: hasMore,
    when: !isLoading,
    onIntersect: onLoadMore,
    rootMargin: SENTINEL_ROOT_MARGIN,
  });

  useEffect(() => {
    setMessageKey(pickRandom(INFINITE_LOAD_MORE_MESSAGE_KEYS));
  }, []);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      setMessageKey(pickRandom(INFINITE_LOAD_MORE_MESSAGE_KEYS));
    }

    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  return {
    sentinelRef,
    messageKey,
    waitingEmoji: INFINITE_LOAD_MORE_EMOJIS[messageKey],
  };
}
