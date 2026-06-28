import { alpha, type Theme } from '@mui/material/styles';

export const feedScreenSx = {
  bgcolor: 'common.black',
  color: 'common.white',
} as const;

/** Active like accent on dark reel chrome — not a global theme token. */
export const feedLikeActiveColor = '#ff4d6d';

export const feedCardSurfaceSx = {
  bgcolor: 'common.black',
} as const;

/** Wide feed (600px+): vertical inset on the reel stage only — comments column stays full height. */
export const FEED_REEL_WIDE_VERTICAL_INSET = 3;

/** Wide feed reel height cap — accounts for `feedReelStageSx` vertical inset. */
export const FEED_REEL_WIDE_MAX_HEIGHT = 'min(calc(100dvh - 48px), 880px)';

/** Wide feed reel card — centered in the stage; rail is absolute on this box. */
export const feedReelItemSx = {
  position: 'relative',
  alignSelf: 'center',
  flex: { xs: 1, sm: '0 0 auto' },
  flexShrink: 0,
  height: { xs: '100%', sm: '100%' },
  maxHeight: { sm: FEED_REEL_WIDE_MAX_HEIGHT },
  width: { xs: '100%', sm: 'auto' },
  minHeight: 0,
  minWidth: 0,
  aspectRatio: { sm: '9 / 16' },
  maxWidth: { xs: '100%', sm: 480 },
} as const;

/** Reel viewport gesture surface — axis lock disables the in-card media carousel. */
export const feedReelViewportGestureSx = {
  touchAction: 'none',
  '&[data-feed-axis-lock="vertical"] [data-feed-media-gallery]': {
    touchAction: 'none',
    pointerEvents: 'none',
  },
} as const;

/** Gap between the reel card and the outside action rail (600px+). */
export const FEED_RAIL_GAP_PX = 10;

/** Wide feed outside action rail — absolute beside the card, lifted from the bottom edge. */
export const feedOutsideRailSx = {
  position: 'absolute',
  left: `calc(100% + ${FEED_RAIL_GAP_PX}px)`,
  bottom: 6,
  zIndex: 3,
  display: { xs: 'none', sm: 'flex' },
  flexDirection: 'column',
} as const;

/** Desktop comments column — in-flow beside the reel stage (900px+). */
export const feedCommentsPanelLayoutSx = {
  flexShrink: 0,
  height: '100%',
  width: { desktop: 300, lg: 'min(42%, 460px)' },
  bgcolor: 'background.paper',
  color: 'text.primary',
  borderLeft: 1,
  borderColor: 'divider',
  overflow: 'hidden',
} as const;

/** Full-width row: reel stage (flex 1) + optional comments column. */
export const feedDesktopSplitRowSx = {
  display: 'flex',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  alignItems: 'stretch',
} as const;

/** Left pane — centers the feed item; nav chevrons are absolute on this box. */
export const feedReelStageSx = {
  position: 'relative',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  py: { sm: FEED_REEL_WIDE_VERTICAL_INSET },
  boxSizing: 'border-box',
} as const;

/** Vertical prev/next controls on the reel stage (not on the card). */
export const feedNavStackSx = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 4,
  display: { xs: 'none', sm: 'flex' },
  right: { xs: 8, sm: `${FEED_RAIL_GAP_PX}px` },
} as const;

export function feedGlassIconButtonSx(theme: Theme) {
  return {
    color: 'common.white',
    bgcolor: alpha(theme.palette.common.black, 0.35),
    '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.55) },
  };
}

/** Feed close control — fixed touch target, glass background, readable on bright media. */
export function feedExitButtonSx(theme: Theme) {
  return {
    color: theme.palette.common.white,
    width: 44,
    height: 44,
    bgcolor: alpha(theme.palette.common.black, 0.55),
    backdropFilter: 'blur(8px)',
    boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.45)}`,
    '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.72) },
  };
}

export function feedNavIconButtonSx(theme: Theme) {
  return {
    color: 'common.white',
    bgcolor: alpha(theme.palette.common.white, 0.12),
    '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.22) },
    '&.Mui-disabled': { color: alpha(theme.palette.common.white, 0.3) },
  };
}

export function feedMutedTextSx(theme: Theme) {
  return { color: alpha(theme.palette.common.white, 0.78) };
}

export function feedSubtleChipSx(theme: Theme) {
  return {
    color: 'common.white',
    bgcolor: alpha(theme.palette.common.white, 0.16),
    fontWeight: 600,
    '& .MuiChip-deleteIcon': {
      color: alpha(theme.palette.common.white, 0.92),
      bgcolor: alpha(theme.palette.common.black, 0.42),
      borderRadius: '50%',
      fontSize: 16,
      margin: '0 2px 0 -2px',
      transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shorter,
      }),
      '&:hover': {
        color: theme.palette.common.white,
        bgcolor: alpha(theme.palette.common.black, 0.62),
      },
    },
  };
}

export function feedOutlinedButtonSx(theme: Theme) {
  return {
    color: 'common.white',
    borderColor: alpha(theme.palette.common.white, 0.6),
  };
}

export function feedEndGlowSx(theme: Theme) {
  return {
    background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.common.black, 0)} 70%)`,
  };
}

export function feedDetailsGradientSx(theme: Theme) {
  return {
    color: 'common.white',
    background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.97)} 0%, ${alpha(theme.palette.common.black, 0.93)} 28%, ${alpha(theme.palette.common.black, 0.82)} 50%, ${alpha(theme.palette.common.black, 0.58)} 72%, ${alpha(theme.palette.common.black, 0.28)} 88%, ${alpha(theme.palette.common.black, 0)} 100%)`,
  };
}

export function feedDetailsMetaTextSx(theme: Theme) {
  return { color: alpha(theme.palette.common.white, 0.7) };
}

export function feedDetailsBodyTextSx(theme: Theme) {
  return { color: alpha(theme.palette.common.white, 0.88) };
}

export function feedDetailsTextShadowSx(theme: Theme) {
  return { textShadow: `0 1px 10px ${alpha(theme.palette.common.black, 0.45)}` };
}
