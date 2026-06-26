'use client';

import type { HTMLAttributes, PointerEventHandler } from 'react';
import { useCallback, useRef } from 'react';

import { useCarouselContext } from './carousel-context';

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [contenteditable="true"], [data-feed-no-swipe]';
const TAP_MOVE_THRESHOLD_PX = 12;
const LEFT_ZONE_RATIO = 0.32;
const RIGHT_ZONE_RATIO = 0.68;

export type CarouselStoryNavConfig = {
  count: number;
  previousLabel: string;
  nextLabel: string;
};

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
}

export function useCarouselStoryNav(
  storyNav: CarouselStoryNavConfig | undefined,
): Pick<
  HTMLAttributes<HTMLElement>,
  'onPointerDownCapture' | 'onPointerUpCapture' | 'onPointerCancelCapture'
> {
  const { emblaApi, selectedIndex } = useCarouselContext();
  const gestureRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDownCapture: PointerEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (!storyNav || storyNav.count <= 1 || event.button !== 0 || isInteractiveTarget(event.target)) {
        return;
      }

      gestureRef.current = { x: event.clientX, y: event.clientY };
    },
    [storyNav],
  );

  const onPointerUpCapture: PointerEventHandler<HTMLElement> = useCallback(
    (event) => {
      if (!storyNav || storyNav.count <= 1 || event.button !== 0 || isInteractiveTarget(event.target)) {
        gestureRef.current = null;
        return;
      }

      const start = gestureRef.current;
      gestureRef.current = null;

      if (!start) {
        return;
      }

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD_PX) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      const currentIndex = emblaApi?.selectedScrollSnap() ?? selectedIndex;

      if (ratio < LEFT_ZONE_RATIO && currentIndex > 0) {
        emblaApi?.scrollTo(currentIndex - 1, true);
        return;
      }

      if (ratio > RIGHT_ZONE_RATIO && currentIndex < storyNav.count - 1) {
        emblaApi?.scrollTo(currentIndex + 1, true);
      }
    },
    [emblaApi, selectedIndex, storyNav],
  );

  const onPointerCancelCapture: PointerEventHandler<HTMLElement> = useCallback(() => {
    gestureRef.current = null;
  }, []);

  if (!storyNav || storyNav.count <= 1) {
    return {};
  }

  return {
    onPointerDownCapture,
    onPointerUpCapture,
    onPointerCancelCapture,
  };
}
