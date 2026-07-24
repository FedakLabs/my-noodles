/** Default MUI Fab is 56px; support chat FAB is 12.5% larger (half of the prior +25%). */
export const SUPPORT_CHAT_FAB_SIZE = Math.round(56 * 1.125);
export const SUPPORT_CHAT_FAB_ICON_SIZE = Math.round(24 * 1.125);

/** Fixed insets — nudged in from the corner, then +5px left/top (half of prior +10). */
export const SUPPORT_CHAT_FAB_INSET = {
  right: { mobile: 33, desktop: 45 },
  bottom: { mobile: 33, desktop: 45 },
} as const;

const PANEL_GAP_ABOVE_FAB = 16;

/** Panel sits above the FAB with a comfortable gap. */
export const SUPPORT_CHAT_PANEL_INSET = {
  right: SUPPORT_CHAT_FAB_INSET.right,
  bottom: {
    mobile: SUPPORT_CHAT_FAB_INSET.bottom.mobile + SUPPORT_CHAT_FAB_SIZE + PANEL_GAP_ABOVE_FAB,
    desktop: SUPPORT_CHAT_FAB_INSET.bottom.desktop + SUPPORT_CHAT_FAB_SIZE + PANEL_GAP_ABOVE_FAB,
  },
} as const;
