import { alpha, type Theme } from '@mui/material/styles';

export const feedScreenSx = {
  bgcolor: 'common.black',
  color: 'common.white',
} as const;

export const feedCardSurfaceSx = {
  bgcolor: 'common.black',
} as const;

export function feedGlassIconButtonSx(theme: Theme) {
  return {
    color: 'common.white',
    bgcolor: alpha(theme.palette.common.black, 0.35),
    '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.55) },
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
