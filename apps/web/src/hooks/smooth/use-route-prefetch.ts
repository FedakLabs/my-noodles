'use client';

import { useCallback, useMemo, useRef } from 'react';

import { useRouter } from '@/i18n/navigation';

type RouteHref = Parameters<ReturnType<typeof useRouter>['prefetch']>[0];

function routeKey(href: RouteHref): string {
  return typeof href === 'string' ? href : href.pathname;
}

export function useRoutePrefetch(href: RouteHref) {
  const router = useRouter();
  const prefetchedKeyRef = useRef<string | null>(null);

  const prefetch = useCallback(() => {
    const key = routeKey(href);
    if (prefetchedKeyRef.current === key) {
      return;
    }

    prefetchedKeyRef.current = key;
    void router.prefetch(href);
  }, [href, router]);

  const bindPrefetchOnIntent = useMemo(
    () => ({
      onMouseEnter: prefetch,
      onFocus: prefetch,
      onTouchStart: prefetch,
    }),
    [prefetch],
  );

  return { prefetch, bindPrefetchOnIntent };
}
