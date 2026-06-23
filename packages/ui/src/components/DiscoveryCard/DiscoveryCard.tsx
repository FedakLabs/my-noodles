'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CSSProperties, ElementType, MouseEvent, ReactNode } from 'react';

import {
  type GalleryImageInput,
  galleryImages,
  MediaGallery,
  MediaGalleryImage,
  type MediaGalleryLabels,
  MediaGalleryPlaceholder,
} from '../MediaGallery';

const TITLE_LINES = 2;
const TITLE_LINE_HEIGHT = 1.3;
const SUBTITLE_LINE_HEIGHT = 1.43;

const textSlotSx = {
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  overflowWrap: 'anywhere',
} as const;

export type DiscoveryCardImage = GalleryImageInput;

export type DiscoveryCardLink = {
  component: ElementType;
  href: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  props?: Record<string, unknown>;
};

export type DiscoveryCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  price: ReactNode;
  images?: DiscoveryCardImage[];
  imageMode?: 'carousel' | 'static';
  galleryLabels?: Pick<MediaGalleryLabels, 'gallery' | 'slide'>;
  skinStyle?: CSSProperties;
  action?: ReactNode;
  link?: DiscoveryCardLink;
};

export function DiscoveryCard({
  title,
  subtitle,
  price,
  images = [],
  imageMode = 'carousel',
  galleryLabels,
  skinStyle,
  action,
  link,
}: DiscoveryCardProps) {
  const LinkComponent = link?.component ?? 'div';
  const heroImage = images[0];
  const imageFrameSx = {
    aspectRatio: '1',
    borderRadius: 1.5,
    overflow: 'hidden',
    bgcolor: 'action.hover',
    flexShrink: 0,
  } as const;

  const renderHeroImage = () => {
    if (!heroImage) {
      return (
        <Box sx={imageFrameSx}>
          <MediaGalleryPlaceholder />
        </Box>
      );
    }

    return (
      <Box sx={imageFrameSx}>
        <MediaGalleryImage
          url={heroImage.url}
          alt={heroImage.alt}
          viewTransitionName={heroImage.viewTransitionName}
        />
      </Box>
    );
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        height: '100%',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundImage: skinStyle ? 'var(--skin-card-gradient)' : undefined,
      }}
      style={skinStyle}
    >
      {images.length > 0 ? (
        imageMode === 'static' ? (
          renderHeroImage()
        ) : (
          <MediaGallery items={galleryImages(images)} density="compact" labels={galleryLabels} />
        )
      ) : (
        <Box sx={imageFrameSx}>
          <MediaGalleryPlaceholder />
        </Box>
      )}

      <Box
        component={LinkComponent}
        {...(link?.href ? { href: link.href } : {})}
        {...link?.props}
        onClick={link?.onClick}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            ...textSlotSx,
            lineHeight: TITLE_LINE_HEIGHT,
            minHeight: `${TITLE_LINES * TITLE_LINE_HEIGHT}em`,
            display: '-webkit-box',
            WebkitLineClamp: TITLE_LINES,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>

        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              ...textSlotSx,
              lineHeight: SUBTITLE_LINE_HEIGHT,
              minHeight: `${SUBTITLE_LINE_HEIGHT}em`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </Typography>
        ) : null}

        <Typography variant="subtitle2" sx={{ ...textSlotSx, mt: 0.5, flexShrink: 0 }}>
          {price}
        </Typography>
      </Box>

      {action ? <Box sx={{ mt: 'auto', flexShrink: 0, width: '100%' }}>{action}</Box> : null}
    </Stack>
  );
}
