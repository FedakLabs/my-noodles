import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type MouseEvent, type ReactNode } from 'react';

type RailButtonProps = {
  label: string;
  caption?: string;
  active?: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'menu';
  'aria-expanded'?: boolean;
};

export function RailButton({ label, caption, active = false, onClick, children, ...rest }: RailButtonProps) {
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
      <IconButton
        aria-label={label}
        onClick={onClick}
        sx={{ color: active ? '#ff4d6d' : '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
        {...rest}
      >
        {children}
      </IconButton>
      {caption ? (
        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
          {caption}
        </Typography>
      ) : null}
    </Stack>
  );
}
