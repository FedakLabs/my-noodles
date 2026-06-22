export const SMOOTH_SHOW_DELAY_MS = 250;
export const SMOOTH_TRANSITION_MS = 450;
/** Once the veil is shown, keep it visible at least this long to avoid an on/off flash. */
export const SMOOTH_MIN_VISIBLE_MS = 320;
export const SMOOTH_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export type SmoothMotionTokens = {
  showDelayMs: number;
  transitionMs: number;
  minVisibleMs: number;
  transitionEasing: string;
};

export function resolveSmoothMotionTokens(prefersReducedMotion: boolean): SmoothMotionTokens {
  return {
    showDelayMs: prefersReducedMotion ? 0 : SMOOTH_SHOW_DELAY_MS,
    transitionMs: prefersReducedMotion ? 0 : SMOOTH_TRANSITION_MS,
    minVisibleMs: prefersReducedMotion ? 0 : SMOOTH_MIN_VISIBLE_MS,
    transitionEasing: prefersReducedMotion ? 'linear' : SMOOTH_TRANSITION_EASING,
  };
}
