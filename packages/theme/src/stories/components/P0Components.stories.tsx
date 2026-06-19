import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      {children}
      <Divider />
    </Stack>
  );
}

function P0Components() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Stack spacing={3} sx={{ maxWidth: 520 }}>
      <Section title="Button — contained">
        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" disabled>
            Disabled
          </Button>
          <Button variant="contained" size="small">
            Small
          </Button>
          <Button variant="contained" size="large">
            Large
          </Button>
        </Stack>
      </Section>

      <Section title="Button — outlined & text">
        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
          <Button variant="outlined">Outlined</Button>
          <Button variant="outlined" disabled>
            Disabled
          </Button>
          <Button variant="text">Text</Button>
        </Stack>
      </Section>

      <Section title="IconButton — 44px tap target">
        <Stack direction="row" gap={1}>
          <IconButton aria-label="add">+</IconButton>
          <IconButton aria-label="close" disabled>
            ×
          </IconButton>
        </Stack>
      </Section>

      <Section title="Chip — filter states">
        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
          <Chip label="Категорія" variant="outlined" />
          <Chip label="Обрано" variant="filled" color="primary" />
          <Chip label="Disabled" variant="outlined" disabled />
          <Chip label="Китай" variant="outlined" size="small" />
        </Stack>
      </Section>

      <Section title="TextField — outlined">
        <Stack spacing={2}>
          <TextField label="Місто" placeholder="Київ" fullWidth />
          <TextField label="Телефон" defaultValue="+380 67 123 4567" fullWidth />
          <TextField label="Помилка" error helperText="Вкажіть відділення" fullWidth />
          <TextField label="Disabled" disabled defaultValue="Недоступно" fullWidth />
        </Stack>
      </Section>

      <Section title="Paper & Card — discovery radius + soft lift">
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Paper (default elevation)</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Paper elevation={0}</Typography>
          </Paper>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Card</Typography>
              <Typography variant="body2" color="text.secondary">
                Product card chrome — 20px radius, warm border.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Section>

      <Section title="Dialog & Drawer — sheet chrome">
        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
          <Button
            variant="outlined"
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            Open dialog
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDrawerOpen(true);
            }}
          >
            Open drawer
          </Button>
        </Stack>
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
          }}
        >
          <DialogTitle>Dialog</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Sheet radius, border-first elevation.</Typography>
          </DialogContent>
        </Dialog>
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1">Filter bottom sheet</Typography>
            <Typography variant="body2" color="text.secondary">
              Top corners {24}px — mobile filter shell.
            </Typography>
          </Box>
        </Drawer>
      </Section>
    </Stack>
  );
}

const meta = {
  title: 'Components/P0',
  component: P0Components,
} satisfies Meta<typeof P0Components>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllStates: Story = {};
