'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import MynoodlesLogo from '../../icons/mynoodles-logo.svg';

export type MediaGalleryPlaceholderProps = {
  sx?: SxProps<Theme>;
};

/** Branded fallback when product media is missing or fails to load. */
export function MediaGalleryPlaceholder({ sx }: MediaGalleryPlaceholderProps) {
  const baseSx: SxProps<Theme> = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'action.hover',
  };

  return (
    <Box sx={sx ? ([baseSx, sx] as SxProps<Theme>) : baseSx}>
      <MynoodlesLogo
        aria-hidden
        style={{
          width: '40%',
          maxWidth: 120,
          height: 'auto',
          opacity: 0.85,
        }}
      />
    </Box>
  );
}
