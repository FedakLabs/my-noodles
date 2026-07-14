'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  formatRemainingMs,
  remainingMsUntil,
  type UseDeadlineCountdownOptions,
  type UseDeadlineCountdownResult,
} from './deadline-countdown';

export function useDeadlineCountdown({
  expiresAt,
  onExpire,
  intervalMs = 1_000,
  enabled = true,
}: UseDeadlineCountdownOptions): UseDeadlineCountdownResult {
  const expiredNotifiedRef = useRef(false);
  const [remainingMs, setRemainingMs] = useState(() => remainingMsUntil(expiresAt));

  const sync = useCallback(() => {
    if (!enabled) {
      return;
    }

    const next = remainingMsUntil(expiresAt);
    setRemainingMs(next);

    if (next === 0 && !expiredNotifiedRef.current) {
      expiredNotifiedRef.current = true;
      onExpire?.();
    }
  }, [enabled, expiresAt, onExpire]);

  useEffect(() => {
    expiredNotifiedRef.current = false;
    if (enabled) {
      setRemainingMs(remainingMsUntil(expiresAt));
    }
  }, [enabled, expiresAt]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      sync();
    });

    let intervalId: number | undefined;

    const startInterval = () => {
      if (intervalId != null) {
        return;
      }

      intervalId = window.setInterval(sync, intervalMs);
    };

    const stopInterval = () => {
      if (intervalId == null) {
        return;
      }

      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sync();
        startInterval();
      } else {
        stopInterval();
      }
    };

    if (document.visibilityState === 'visible') {
      startInterval();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', sync);

    return () => {
      cancelAnimationFrame(frameId);
      stopInterval();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', sync);
    };
  }, [enabled, intervalMs, sync]);

  return {
    remainingMs,
    isExpired: remainingMs === 0,
    formattedRemaining: formatRemainingMs(remainingMs),
    sync,
  };
}
