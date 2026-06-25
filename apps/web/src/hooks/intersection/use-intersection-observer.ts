'use client';

import { useEffect, useRef } from 'react';

type UseIntersectionObserverOptions = {
  enabled?: boolean;
  when?: boolean;
  onIntersect: () => void;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useIntersectionObserver<T extends Element = Element>({
  enabled = true,
  when = true,
  onIntersect,
  root,
  rootMargin,
  threshold = 0,
}: UseIntersectionObserverOptions) {
  const targetRef = useRef<T>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = targetRef.current;
    if (!node || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && when) {
          onIntersectRef.current();
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, when, root, rootMargin, threshold]);

  return targetRef;
}
