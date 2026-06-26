import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type MouseEvent, type ReactNode } from 'react';

import { feedLikeActiveColor } from '@/components/feed/feed-chrome';

type RailButtonProps = {
  label: string;
  caption?: string;
  active?: boolean;
  compact?: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'menu';
  'aria-expanded'?: boolean;
};

export function RailButton({
  label,
  caption,
  active = false,
  compact = false,
  onClick,
  children,
  ...rest
}: RailButtonProps) {
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
      <IconButton
        aria-label={label}
        size="medium"
        onClick={onClick}
        sx={{
          color: active ? feedLikeActiveColor : 'common.white',
          p: compact ? 0.75 : 1,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
        }}
        {...rest}
      >
        {children}
      </IconButton>
      {caption ? (
        <Typography
          variant="caption"
          sx={{ color: 'common.white', fontWeight: 600, fontSize: compact ? '0.65rem' : undefined }}
        >
          {caption}
        </Typography>
      ) : null}
    </Stack>
  );
}
