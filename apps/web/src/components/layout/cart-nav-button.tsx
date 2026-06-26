'use client';

import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { iconStyle } from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';

import { useCartActions, useCartItemCount } from '@/hooks/cart';

type CartNavButtonProps = {
  label: string;
  compact?: boolean;
  iconSize?: number;
  labelVariant?: 'body1' | 'body2';
  sx?: SxProps<Theme>;
};

export function CartNavButton({
  label,
  compact = false,
  iconSize = 22,
  labelVariant = 'body2',
  sx,
}: CartNavButtonProps) {
  const cartCount = useCartItemCount();
  const { openPanel } = useCartActions();

  const icon = (
    <Badge badgeContent={cartCount} color="primary" invisible={cartCount === 0}>
      <CartIcon aria-hidden style={iconStyle({ size: iconSize, color: 'inherit' })} />
    </Badge>
  );

  if (compact) {
    return (
      <IconButton color="inherit" aria-label={label} onClick={openPanel} sx={sx}>
        {icon}
      </IconButton>
    );
  }

  return (
    <Button
      variant="text"
      color="inherit"
      onClick={openPanel}
      sx={{
        alignItems: 'center',
        display: 'inline-flex',
        minWidth: 'auto',
        px: { mobile: 1, desktop: 1.5 },
        ...sx,
      }}
    >
      <Stack
        component="span"
        direction="row"
        spacing={labelVariant === 'body1' ? 1.5 : 0.75}
        sx={{ alignItems: 'center', color: 'inherit' }}
      >
        {icon}
        <Typography variant={labelVariant} component="span">
          {label}
        </Typography>
      </Stack>
    </Button>
  );
}
