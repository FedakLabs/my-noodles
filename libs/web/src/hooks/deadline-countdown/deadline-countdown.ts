export function remainingMsUntil(deadline: string | number): number {
  const deadlineMs = typeof deadline === 'number' ? deadline : Date.parse(deadline);
  return Math.max(0, deadlineMs - Date.now());
}

/** Formats milliseconds as `m:ss` (e.g. `4:05`). */
export function formatRemainingMs(remainingMs: number): string {
  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1_000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export type UseDeadlineCountdownOptions = {
  /** ISO timestamp or epoch ms when the countdown ends. */
  expiresAt: string | number;
  /** Fires once when the countdown reaches zero for the current `expiresAt`. */
  onExpire?: () => void;
  /** Poll interval while the tab is visible. Defaults to 1s. */
  intervalMs?: number;
  /** When false, timers are not scheduled and `remainingMs` stays at the last computed value. */
  enabled?: boolean;
};

export type UseDeadlineCountdownResult = {
  remainingMs: number;
  isExpired: boolean;
  formattedRemaining: string;
  /** Recompute remaining time immediately (also runs on window focus). */
  sync: () => void;
};
