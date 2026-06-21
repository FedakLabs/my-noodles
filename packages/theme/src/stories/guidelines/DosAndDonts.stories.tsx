import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';

function DosAndDonts() {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
          Don&apos;t — flag as background
        </Typography>
        <Card
          sx={{
            background: 'linear-gradient(180deg, #B22234 33%, #fff 33%, #fff 66%, #3C3B6E 66%)',
            color: 'text.primary',
          }}
        >
          <CardContent>
            <Typography variant="body2">Flag literal — breaks cohesive shop feel.</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
          Do — flavor gradient on card top
        </Typography>
        <Card
          sx={{
            backgroundImage:
              'linear-gradient(180deg, rgba(185, 28, 28, 0.15) 0%, rgba(60, 59, 110, 0.08) 45%, transparent 45%)',
            backgroundColor: 'background.paper',
          }}
        >
          <CardContent>
            <Typography variant="body2">Soft top gradient + accent button — Flavor intensity.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}

const meta = {
  title: 'Guidelines/Do & Don&apos;t',
  component: DosAndDonts,
} satisfies Meta<typeof DosAndDonts>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkinBackgrounds: Story = {};
