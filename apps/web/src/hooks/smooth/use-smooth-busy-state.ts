'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerSnapshot() {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const SHOW_DELAY_MS = 250;
const TRANSITION_MS = 450;
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export type SmoothBusyState = {
  /** Overlay/scrim is in the DOM (includes exit animation). */
  mounted: boolean;
  /** Overlay/scrim is visually active (fade-in complete). */
  active: boolean;
  transitionMs: number;
  transitionEasing: string;
};

export function useSmoothBusyState(busy: boolean): SmoothBusyState {
  const prefersReducedMotion = usePrefersReducedMotion();
  const showDelayMs = prefersReducedMotion ? 0 : SHOW_DELAY_MS;
  const transitionMs = prefersReducedMotion ? 0 : TRANSITION_MS;
  const transitionEasing = prefersReducedMotion ? 'linear' : TRANSITION_EASING;

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const mountedRef = useRef(mounted);

  useEffect(() => {
    mountedRef.current = mounted;
  }, [mounted]);

  useEffect(() => {
    if (busy) {
      if (mountedRef.current) {
        const activateTimer = window.setTimeout(() => setActive(true), 0);
        return () => window.clearTimeout(activateTimer);
      }

      const enterTimer = window.setTimeout(() => {
        setMounted(true);
        setActive(true);
      }, showDelayMs);

      return () => window.clearTimeout(enterTimer);
    }

    if (!mountedRef.current) {
      return undefined;
    }

    const deactivateTimer = window.setTimeout(() => setActive(false), 0);
    const exitTimer = window.setTimeout(() => setMounted(false), transitionMs);
    return () => {
      window.clearTimeout(deactivateTimer);
      window.clearTimeout(exitTimer);
    };
  }, [busy, showDelayMs, transitionMs]);

  return { mounted, active, transitionMs, transitionEasing };
}
