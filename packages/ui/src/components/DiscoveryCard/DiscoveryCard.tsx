'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CSSProperties, ElementType, MouseEvent, ReactNode } from 'react';

const TITLE_LINES = 2;
const TITLE_LINE_HEIGHT = 1.3;
const SUBTITLE_LINE_HEIGHT = 1.43;

const textSlotSx = {
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  overflowWrap: 'anywhere',
} as const;

export type DiscoveryCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  price: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  viewTransitionName?: string;
  skinStyle?: CSSProperties;
  action?: ReactNode;
  linkComponent?: ElementType;
  href?: string;
  onLinkClick?: (event: MouseEvent<HTMLElement>) => void;
  linkProps?: Record<string, unknown>;
};

export function DiscoveryCard({
  title,
  subtitle,
  price,
  imageUrl,
  imageAlt = '',
  viewTransitionName,
  skinStyle,
  action,
  linkComponent: LinkComponent = 'div',
  href,
  onLinkClick,
  linkProps,
}: DiscoveryCardProps) {
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
      <Box
        component={LinkComponent}
        {...(href ? { href } : {})}
        {...linkProps}
        onClick={onLinkClick}
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
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '1',
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            flexShrink: 0,
          }}
        >
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={imageAlt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                ...(viewTransitionName ? { viewTransitionName } : {}),
              }}
            />
          ) : null}
        </Box>

        <Typography
          variant="subtitle1"
          sx={{
            ...textSlotSx,
            mt: 1,
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
