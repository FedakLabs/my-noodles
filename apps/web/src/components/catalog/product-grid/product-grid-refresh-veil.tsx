'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

type ProductGridRefreshVeilProps = {
  visible: boolean;
  label: string;
  transitionMs: number;
  transitionEasing: string;
};

export function ProductGridRefreshVeil({
  visible,
  label,
  transitionMs,
  transitionEasing,
}: ProductGridRefreshVeilProps) {
  const transition = `opacity ${transitionMs}ms ${transitionEasing}, backdrop-filter ${transitionMs}ms ${transitionEasing}`;

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy={visible}
      aria-label={visible ? label : undefined}
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transition,
        bgcolor: alpha(theme.palette.background.default, 0.42),
        backdropFilter: visible ? 'blur(3px)' : 'blur(0px)',
        borderRadius: 1,
      })}
    />
  );
}
