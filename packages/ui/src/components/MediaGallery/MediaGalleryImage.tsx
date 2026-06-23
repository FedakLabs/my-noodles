'use client';

import Box from '@mui/material/Box';
import { useState } from 'react';

import { MediaGalleryPlaceholder } from './MediaGalleryPlaceholder';
import type { GalleryImageInput } from './types';

export type MediaGalleryImageProps = GalleryImageInput;

export function MediaGalleryImage({ url, alt, viewTransitionName }: MediaGalleryImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (!url || loadFailed) {
    return <MediaGalleryPlaceholder />;
  }

  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      onError={() => setLoadFailed(true)}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...(viewTransitionName ? { viewTransitionName } : {}),
      }}
    />
  );
}
