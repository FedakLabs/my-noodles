'use client';

import {
  type PointerEvent,
  type RefObject,
  type TransitionEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const SWIPE_THRESHOLD_PX = 72;
const AXIS_LOCK_THRESHOLD_PX = 10;
export const SWIPE_COMMIT_MS = 320;

const SWIPE_IGNORE_SELECTOR =
  'button, a, input, textarea, [role="button"], [data-feed-no-swipe], [data-feed-scroll-host]';

type AxisLock = 'vertical' | 'horizontal';

function findFeedScrollHost(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const host = target.closest('[data-feed-scroll-host]');
  return host instanceof HTMLElement ? host : null;
}

function canScrollHostConsumeWheel(scrollHost: HTMLElement, deltaY: number): boolean {
  const maxScrollTop = scrollHost.scrollHeight - scrollHost.clientHeight;
  if (maxScrollTop <= 0) {
    return false;
  }

  const atTop = scrollHost.scrollTop <= 0;
  const atBottom = scrollHost.scrollTop >= maxScrollTop - 1;

  if (deltaY > 0) {
    return !atBottom;
  }

  if (deltaY < 0) {
    return !atTop;
  }

  return false;
}

function setAxisLockAttribute(node: HTMLElement | null, lock: AxisLock | null) {
  if (!node) {
    return;
  }

  if (lock) {
    node.setAttribute('data-feed-axis-lock', lock);
  } else {
    node.removeAttribute('data-feed-axis-lock');
  }
}

function setPointerTrackingAttribute(node: HTMLElement | null, tracking: boolean) {
  if (!node) {
    return;
  }

  if (tracking) {
    node.setAttribute('data-feed-pointer-tracking', '');
  } else {
    node.removeAttribute('data-feed-pointer-tracking');
  }
}

export type FeedSwipeDirection = 'next' | 'previous';

type UseFeedSwipeOptions = {
  containerRef: RefObject<HTMLElement | null>;
  slideHeight: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onHorizontalCommit: (direction: FeedSwipeDirection) => void;
};

export function useFeedSwipe({
  containerRef,
  slideHeight,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onHorizontalCommit,
}: UseFeedSwipeOptions) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isPointerTracking, setIsPointerTracking] = useState(false);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [commitDirection, setCommitDirection] = useState<FeedSwipeDirection | null>(null);

  const pointerStartXRef = useRef<number | null>(null);
  const pointerStartYRef = useRef<number | null>(null);
  const axisLockRef = useRef<AxisLock | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const commitTimerRef = useRef<number | null>(null);
  const pendingDirectionRef = useRef<FeedSwipeDirection | null>(null);

  const clearCommitTimer = useCallback(() => {
    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const resetPointerGesture = useCallback(() => {
    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    axisLockRef.current = null;
    activePointerIdRef.current = null;
    setAxisLockAttribute(containerRef.current, null);
    setPointerTrackingAttribute(containerRef.current, false);
    setIsPointerTracking(false);
    setIsVerticalDragging(false);
  }, [containerRef]);

  const completeCommit = useCallback(() => {
    const direction = pendingDirectionRef.current;
    if (!direction) {
      return;
    }

    pendingDirectionRef.current = null;
    clearCommitTimer();

    if (direction === 'next') {
      onNext();
    } else {
      onPrevious();
    }

    // Snap to rest instantly — a eased transition here replays the slide and flickers.
    setIsSnapping(true);
    setDragOffset(0);
    setCommitDirection(null);
    setIsCommitting(false);

    requestAnimationFrame(() => {
      setIsSnapping(false);
    });
  }, [clearCommitTimer, onNext, onPrevious]);

  const commitNav = useCallback(
    (direction: FeedSwipeDirection) => {
      if (isCommitting || slideHeight <= 0) {
        return;
      }

      const allowed = direction === 'next' ? canGoNext : canGoPrevious;
      if (!allowed) {
        setDragOffset(0);
        return;
      }

      pendingDirectionRef.current = direction;
      setCommitDirection(direction);
      setIsCommitting(true);
      setDragOffset(direction === 'next' ? -slideHeight : slideHeight);

      clearCommitTimer();
      commitTimerRef.current = window.setTimeout(completeCommit, SWIPE_COMMIT_MS + 40);
    },
    [canGoNext, canGoPrevious, clearCommitTimer, completeCommit, isCommitting, slideHeight],
  );

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      if (event.propertyName !== 'transform' || !pendingDirectionRef.current) {
        return;
      }
      completeCommit();
    },
    [completeCommit],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (node.getAttribute('data-feed-axis-lock') === 'horizontal') {
        return;
      }

      if (Math.abs(event.deltaY) < 8 || isCommitting || isVerticalDragging) {
        return;
      }

      const scrollHost = findFeedScrollHost(event.target);
      if (
        scrollHost !== null &&
        scrollHost.contains(event.target as Node) &&
        canScrollHostConsumeWheel(scrollHost, event.deltaY)
      ) {
        return;
      }

      event.preventDefault();
      commitNav(event.deltaY > 0 ? 'next' : 'previous');
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [commitNav, containerRef, isCommitting, isVerticalDragging]);

  useEffect(() => clearCommitTimer, [clearCommitTimer]);

  const resolveAxisLock = useCallback((dx: number, dy: number): AxisLock | null => {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < AXIS_LOCK_THRESHOLD_PX) {
      return null;
    }

    return absDy > absDx ? 'vertical' : 'horizontal';
  }, []);

  const handlePointerDownCapture = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 || isCommitting) {
        return;
      }
      if ((event.target as Element).closest(SWIPE_IGNORE_SELECTOR)) {
        return;
      }

      pointerStartXRef.current = event.clientX;
      pointerStartYRef.current = event.clientY;
      axisLockRef.current = null;
      setAxisLockAttribute(containerRef.current, null);
      setPointerTrackingAttribute(containerRef.current, true);
      activePointerIdRef.current = event.pointerId;
      setIsPointerTracking(true);
      setDragOffset(0);
    },
    [containerRef, isCommitting],
  );

  const handlePointerMoveCapture = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (
        !isPointerTracking ||
        activePointerIdRef.current !== event.pointerId ||
        pointerStartXRef.current === null ||
        pointerStartYRef.current === null
      ) {
        return;
      }

      const dx = event.clientX - pointerStartXRef.current;
      const dy = event.clientY - pointerStartYRef.current;

      if (axisLockRef.current === null) {
        const lock = resolveAxisLock(dx, dy);
        if (!lock) {
          return;
        }

        axisLockRef.current = lock;
        setAxisLockAttribute(containerRef.current, lock);
        setPointerTrackingAttribute(containerRef.current, false);
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);

        if (lock === 'horizontal') {
          return;
        }

        setIsVerticalDragging(true);
        setDragOffset(dy);
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (axisLockRef.current === 'horizontal') {
        return;
      }

      let offset = dy;

      if (!canGoNext && offset < 0) {
        offset *= 0.35;
      }
      if (!canGoPrevious && offset > 0) {
        offset *= 0.35;
      }
      if (slideHeight > 0) {
        offset = Math.max(-slideHeight, Math.min(slideHeight, offset));
      }

      setDragOffset(offset);
    },
    [canGoNext, canGoPrevious, containerRef, isPointerTracking, resolveAxisLock, slideHeight],
  );

  const finishPointer = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const lock = axisLockRef.current;
      const startX = pointerStartXRef.current;
      const startY = pointerStartYRef.current;
      resetPointerGesture();

      if (lock === 'horizontal') {
        const dx = startX === null ? 0 : event.clientX - startX;
        if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
          onHorizontalCommit(dx < 0 ? 'next' : 'previous');
        }
        return;
      }

      if (lock !== 'vertical') {
        setDragOffset(0);
        return;
      }

      const offset = startY === null ? dragOffset : event.clientY - startY;

      if (Math.abs(offset) >= SWIPE_THRESHOLD_PX) {
        commitNav(offset < 0 ? 'next' : 'previous');
        return;
      }

      setDragOffset(0);
    },
    [commitNav, dragOffset, onHorizontalCommit, resetPointerGesture],
  );

  const transition =
    isVerticalDragging || isSnapping
      ? 'none'
      : isCommitting
        ? `transform ${SWIPE_COMMIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
        : 'none';

  const showNextLayer = dragOffset < 0 || (isCommitting && commitDirection === 'next');
  const showPrevLayer = dragOffset > 0 || (isCommitting && commitDirection === 'previous');

  return {
    dragOffset,
    isDragging: isVerticalDragging,
    isCommitting,
    commitDirection,
    transition,
    showNextLayer,
    showPrevLayer,
    commitNav,
    handleTransitionEnd,
    layerTransform: {
      current: `translate3d(0, ${dragOffset}px, 0)`,
      next: `translate3d(0, ${slideHeight + dragOffset}px, 0)`,
      previous: `translate3d(0, ${-slideHeight + dragOffset}px, 0)`,
    },
    pointerHandlers: {
      onPointerDownCapture: handlePointerDownCapture,
      onPointerMoveCapture: handlePointerMoveCapture,
      onPointerUp: finishPointer,
      onPointerCancel: finishPointer,
    },
  };
}
