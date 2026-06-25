'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { lazy, type ReactNode, Suspense } from 'react';

import {
  MediaGallery,
  MediaGalleryImage,
  type MediaGalleryItem,
  type MediaGalleryLabels,
  MediaGalleryPlaceholder,
  resolvePrimaryMediaItem,
} from '../MediaGallery';
import { DISCOVERY_CARD_IMAGE_FRAME_SX } from './discovery-card-shared';

const MediaGalleryVideo = lazy(() =>
  import('../MediaGallery/MediaGalleryVideo').then((module) => ({ default: module.MediaGalleryVideo })),
);

const videoFallbackSx = {
  width: '100%',
  height: '100%',
} as const;

export type DiscoveryCardMediaProps = {
  items?: MediaGalleryItem[];
  mode?: 'carousel' | 'static';
  labels?: Pick<MediaGalleryLabels, 'gallery' | 'slide' | 'video'>;
  /** Omit the outer image frame — parent supplies sizing (e.g. expand shell morph). */
  unframed?: boolean;
  sx?: SxProps<Theme>;
};

function renderStaticMediaItem(item: MediaGalleryItem, labels?: DiscoveryCardMediaProps['labels']) {
  if (item.type === 'image') {
    return <MediaGalleryImage url={item.url} alt={item.alt} viewTransitionName={item.viewTransitionName} />;
  }

  return (
    <Suspense fallback={<MediaGalleryPlaceholder sx={videoFallbackSx} />}>
      <MediaGalleryVideo
        url={item.url}
        alt={item.alt}
        posterUrl={item.posterUrl}
        isActive
        labels={
          labels?.video ?? {
            play: 'Play video',
            pause: 'Pause video',
            mute: 'Mute video',
            unmute: 'Unmute video',
          }
        }
      />
    </Suspense>
  );
}

export function DiscoveryCardMedia({
  items = [],
  mode = 'carousel',
  labels,
  unframed = false,
  sx,
}: DiscoveryCardMediaProps) {
  const effectiveMode = items.length <= 1 ? 'static' : mode;
  const frameSx = unframed ? sx : { ...DISCOVERY_CARD_IMAGE_FRAME_SX, ...sx };

  const wrapFrame = (content: ReactNode) => {
    if (unframed) {
      return content;
    }

    return <Box sx={frameSx}>{content}</Box>;
  };

  if (items.length === 0) {
    return wrapFrame(<MediaGalleryPlaceholder />);
  }

  if (effectiveMode === 'carousel') {
    return <MediaGallery items={items} labels={labels} />;
  }

  const primaryMedia = resolvePrimaryMediaItem(items);
  if (!primaryMedia) {
    return wrapFrame(<MediaGalleryPlaceholder />);
  }

  return wrapFrame(renderStaticMediaItem(primaryMedia, labels));
}
