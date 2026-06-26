import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { iconStyle } from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';

const CART_HIGHLIGHT = '#FFC46B';

const cartBumpKeyframes = {
  '@keyframes feedCartBump': {
    '0%': { transform: 'scale(1)' },
    '40%': { transform: 'scale(1.2)' },
    '100%': { transform: 'scale(1)' },
  },
} as const;

type CartRailButtonProps = {
  label: string;
  caption?: string;
  highlighted: boolean;
  bumpKey: number;
  iconSize?: number;
  compact?: boolean;
  onClick: () => void;
};

export function CartRailButton({
  label,
  caption,
  highlighted,
  bumpKey,
  iconSize = 26,
  compact = false,
  onClick,
}: CartRailButtonProps) {
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center', ...cartBumpKeyframes }}>
      <IconButton
        aria-label={label}
        size="medium"
        onClick={onClick}
        sx={{ color: '#fff', p: compact ? 0.75 : 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
      >
        <Stack
          key={bumpKey > 0 ? `cart-bump-${bumpKey}` : 'cart'}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            ...(bumpKey > 0 && { animation: 'feedCartBump 0.5s cubic-bezier(0.34, 1.35, 0.64, 1)' }),
          }}
        >
          <CartIcon
            aria-hidden
            style={{
              ...iconStyle({ size: iconSize, color: highlighted ? CART_HIGHLIGHT : '#fff' }),
              transition: 'color 0.65s ease',
            }}
          />
        </Stack>
      </IconButton>
      {caption ? (
        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
          {caption}
        </Typography>
      ) : null}
    </Stack>
  );
}
