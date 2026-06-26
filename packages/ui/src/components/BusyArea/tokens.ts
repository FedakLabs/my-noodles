export const SMOOTH_SHOW_DELAY_MS = 250;
/** Default opacity fade for progress bars and other non-chrome busy UI. */
export const SMOOTH_TRANSITION_MS = 450;
/** Softer, longer fade for dim chrome. */
export const BUSY_CHROME_TRANSITION_MS = 750;
/** Once busy chrome is shown, keep it visible at least this long to avoid an on/off flash. */
export const SMOOTH_MIN_VISIBLE_MS = 320;
export const SMOOTH_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** Symmetric ease — gentle fade in and out for dim. */
export const BUSY_CHROME_TRANSITION_EASING = 'cubic-bezier(0.45, 0, 0.55, 1)';

/** Content dim when `dim` is enabled on BusyArea. */
export const BUSY_CONTENT_DIM_OPACITY = 0.65;
/** Above elevated in-region overlays (e.g. DiscoveryCard preview at 12). */
export const BUSY_SCRIM_Z_INDEX = 20;

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

export function resolveBusyChromeMotionTokens(): SmoothMotionTokens {
  return {
    showDelayMs: SMOOTH_SHOW_DELAY_MS,
    transitionMs: BUSY_CHROME_TRANSITION_MS,
    minVisibleMs: SMOOTH_MIN_VISIBLE_MS,
    transitionEasing: BUSY_CHROME_TRANSITION_EASING,
  };
}
