import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import type { OrderStatus } from '@my-noodles/api-clients/admin';
import { useTranslation } from 'react-i18next';

/**
 * Distinct accent per status (text + border; background is a soft tint of the same hue).
 * Kept local to admin — order lifecycle colors are not part of the storefront theme tokens.
 */
const STATUS_ACCENT: Record<OrderStatus, string> = {
  draft: '#6B635C',
  new: '#1E3A5F',
  confirmed: '#2A9D8F',
  sent: '#7C3AED',
  arrived: '#D97706',
  completed: '#2D6A4F',
  cancelled: '#C62828',
  returned: '#E85D4C',
  archived: '#A69E96',
};

type OrderStatusChipProps = {
  status: OrderStatus;
  size?: 'small' | 'medium';
};

export function OrderStatusChip({ status, size = 'small' }: OrderStatusChipProps) {
  const { t } = useTranslation('orders');
  const accent = STATUS_ACCENT[status];

  return (
    <Chip
      size={size}
      label={t(`status.${status}`)}
      variant="outlined"
      sx={{
        color: accent,
        borderColor: alpha(accent, 0.45),
        bgcolor: alpha(accent, 0.12),
        fontWeight: 600,
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
}
