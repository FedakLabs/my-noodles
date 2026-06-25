'use client';

import { useEffect, useRef, useState } from 'react';

import {
  SMOOTH_MIN_VISIBLE_MS,
  SMOOTH_SHOW_DELAY_MS,
  SMOOTH_TRANSITION_EASING,
  SMOOTH_TRANSITION_MS,
} from './tokens';

export type BusyAreaState = {
  /** Scrim is in the DOM (includes exit animation). */
  mounted: boolean;
  /** Dim/scrim is visually active (fade-in complete). */
  active: boolean;
  transitionMs: number;
  transitionEasing: string;
};

export type BusyAreaTimingOptions = {
  /** Minimum time busy chrome stays up after `busy` becomes false. Navigation uses 0. */
  minVisibleMs?: number;
};

export function useBusyAreaState(busy: boolean, options?: BusyAreaTimingOptions): BusyAreaState {
  const showDelayMs = SMOOTH_SHOW_DELAY_MS;
  const transitionMs = SMOOTH_TRANSITION_MS;
  const minVisibleMs = options?.minVisibleMs ?? SMOOTH_MIN_VISIBLE_MS;
  const transitionEasing = SMOOTH_TRANSITION_EASING;

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const mountedRef = useRef(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = mounted;
  }, [mounted]);

  useEffect(() => {
    if (busy) {
      if (mountedRef.current) {
        const raf = window.requestAnimationFrame(() => {
          shownAtRef.current ??= Date.now();
          setActive(true);
        });
        return () => window.cancelAnimationFrame(raf);
      }

      let raf = 0;
      const enterTimer = window.setTimeout(() => {
        setMounted(true);
        raf = window.requestAnimationFrame(() => {
          shownAtRef.current = Date.now();
          setActive(true);
        });
      }, showDelayMs);

      return () => {
        window.clearTimeout(enterTimer);
        window.cancelAnimationFrame(raf);
      };
    }

    if (!mountedRef.current) {
      return undefined;
    }

    const shownAt = shownAtRef.current;
    const elapsed = shownAt == null ? minVisibleMs : Date.now() - shownAt;
    const holdMs = Math.max(0, minVisibleMs - elapsed);

    const deactivateTimer = window.setTimeout(() => setActive(false), holdMs);
    const exitTimer = window.setTimeout(() => {
      setMounted(false);
      shownAtRef.current = null;
    }, holdMs + transitionMs);

    return () => {
      window.clearTimeout(deactivateTimer);
      window.clearTimeout(exitTimer);
    };
  }, [busy, showDelayMs, transitionMs, minVisibleMs]);

  return { mounted, active, transitionMs, transitionEasing };
}
