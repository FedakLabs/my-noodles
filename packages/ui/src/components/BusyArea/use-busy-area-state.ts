'use client';

import { useEffect, useRef, useState } from 'react';

import {
  BUSY_CHROME_TRANSITION_EASING,
  BUSY_CHROME_TRANSITION_MS,
  SMOOTH_MIN_VISIBLE_MS,
  SMOOTH_SHOW_DELAY_MS,
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
  /** Delay before busy chrome mounts. Catalog refetch uses 0 for immediate scrim. */
  showDelayMs?: number;
  /** Opacity fade duration — defaults to soft chrome timing (dim/scrim). */
  transitionMs?: number;
  transitionEasing?: string;
};

export function useBusyAreaState(busy: boolean, options?: BusyAreaTimingOptions): BusyAreaState {
  const showDelayMs = options?.showDelayMs ?? SMOOTH_SHOW_DELAY_MS;
  const transitionMs = options?.transitionMs ?? BUSY_CHROME_TRANSITION_MS;
  const minVisibleMs = options?.minVisibleMs ?? SMOOTH_MIN_VISIBLE_MS;
  const transitionEasing = options?.transitionEasing ?? BUSY_CHROME_TRANSITION_EASING;

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (busy) {
      if (mounted) {
        let cancelled = false;
        const raf = window.requestAnimationFrame(() => {
          if (cancelled || !busyRef.current) {
            return;
          }
          shownAtRef.current ??= Date.now();
          setActive(true);
        });
        return () => {
          cancelled = true;
          window.cancelAnimationFrame(raf);
        };
      }

      let cancelled = false;
      let raf = 0;
      const enterTimer = window.setTimeout(() => {
        if (cancelled || !busyRef.current) {
          return;
        }
        setMounted(true);
        raf = window.requestAnimationFrame(() => {
          if (cancelled || !busyRef.current) {
            return;
          }
          shownAtRef.current = Date.now();
          setActive(true);
        });
      }, showDelayMs);

      return () => {
        cancelled = true;
        window.clearTimeout(enterTimer);
        window.cancelAnimationFrame(raf);
      };
    }

    if (!mounted) {
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
  }, [busy, mounted, showDelayMs, transitionMs, minVisibleMs, transitionEasing]);

  return { mounted, active, transitionMs, transitionEasing };
}
