import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { discoveryWash } from '../../shadows';

function DiscoveryVsCheckout() {
  const theme = useTheme();
  const wash = discoveryWash(theme.colors.surface.bgHueBrand);

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          background: wash,
          bgcolor: 'background.default',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
        }}
      >
        <Typography variant="h2">Колекція TikTok Foods</Typography>
        <Typography variant="body2" color="text.secondary">
          D-lite wash on discovery surfaces only — barely perceptible warm tint.
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.default',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
        }}
      >
        <Typography variant="h6">Оформлення замовлення</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Checkout stays clean — no decorative wash, maximum clarity.
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 360 }}>
          <TextField label="Ім'я" fullWidth />
          <TextField label="Телефон" fullWidth />
        </Stack>
      </Box>
    </Stack>
  );
}

const meta = {
  title: 'Surfaces/Discovery vs Checkout',
  component: DiscoveryVsCheckout,
} satisfies Meta<typeof DiscoveryVsCheckout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Comparison: Story = {};
