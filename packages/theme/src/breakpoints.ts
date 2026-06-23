import type { BreakpointsOptions } from '@mui/material/styles';

/** Min viewport width (px) for desktop shell layout (sidebar, horizontal nav, side drawers). */
export const DESKTOP_MIN_WIDTH = 900;

export const breakpoints: BreakpointsOptions = {
  values: {
    xs: 0,
    mobile: 0,
    sm: 600,
    md: DESKTOP_MIN_WIDTH,
    desktop: DESKTOP_MIN_WIDTH,
    lg: 1200,
    xl: 1536,
  },
};

/** Responsive `display` values for the mobile/desktop layout split. */
export const layoutDisplay = {
  mobileOnlyBlock: { mobile: 'block', desktop: 'none' },
  mobileOnlyFlex: { mobile: 'flex', desktop: 'none' },
  mobileOnlyInlineFlex: { mobile: 'inline-flex', desktop: 'none' },
  desktopOnlyBlock: { mobile: 'none', desktop: 'block' },
  desktopOnlyFlex: { mobile: 'none', desktop: 'flex' },
} as const;
