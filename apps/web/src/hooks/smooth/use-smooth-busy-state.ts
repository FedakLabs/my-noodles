'use client';

import { useEffect, useRef, useState } from 'react';

import { resolveSmoothMotionTokens } from './smooth-tokens';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

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
  const { showDelayMs, transitionMs, minVisibleMs, transitionEasing } =
    resolveSmoothMotionTokens(prefersReducedMotion);

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const mountedRef = useRef(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = mounted;
  }, [mounted]);

  useEffect(() => {
    if (busy) {
      // Already in the DOM (e.g. re-busy during an exit hold): just (re)activate next frame.
      if (mountedRef.current) {
        const raf = window.requestAnimationFrame(() => {
          shownAtRef.current ??= Date.now();
          setActive(true);
        });
        return () => window.cancelAnimationFrame(raf);
      }

      // Fresh entry: mount at opacity 0, then flip active on the next frame so the
      // browser has a 0 -> 1 transition to animate (mounting + activating together pops in).
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

    // Keep the veil up for a minimum visible window so a fast finish doesn't flash on/off.
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
