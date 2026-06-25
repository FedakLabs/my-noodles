export const SMOOTH_SHOW_DELAY_MS = 250;
export const SMOOTH_TRANSITION_MS = 450;
/** Once busy chrome is shown, keep it visible at least this long to avoid an on/off flash. */
export const SMOOTH_MIN_VISIBLE_MS = 320;
export const SMOOTH_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Flat scrim overlay — navigation shell, catalog grid, filter panel (opacity only, no backdrop blur). */
export const BUSY_SCRIM_ALPHA = 0.55;
/** Content dim when `dim` is enabled on BusyArea. */
export const BUSY_CONTENT_DIM_OPACITY = 0.65;

export function busyScrimTransition(transitionMs: number, transitionEasing: string): string {
  return `opacity ${transitionMs}ms ${transitionEasing}`;
}

export function busyContentDimTransition(transitionMs: number, transitionEasing: string): string {
  return `opacity ${transitionMs}ms ${transitionEasing}`;
}

export type SmoothMotionTokens = {
  showDelayMs: number;
  transitionMs: number;
  minVisibleMs: number;
  transitionEasing: string;
};

export function resolveSmoothMotionTokens(): SmoothMotionTokens {
  return {
    showDelayMs: SMOOTH_SHOW_DELAY_MS,
    transitionMs: SMOOTH_TRANSITION_MS,
    minVisibleMs: SMOOTH_MIN_VISIBLE_MS,
    transitionEasing: SMOOTH_TRANSITION_EASING,
  };
}
