import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  resolveSmoothMotionTokens,
  SMOOTH_TRANSITION_EASING,
  SMOOTH_TRANSITION_MS,
} from '../components/BusyArea';
import { StableLinearProgress } from '../components/StableLinearProgress';

const meta = {
  title: 'Components/StableLinearProgress',
  component: StableLinearProgress,
  args: {
    'aria-label': 'Loading',
    transitionMs: SMOOTH_TRANSITION_MS,
    transitionEasing: SMOOTH_TRANSITION_EASING,
  },
} satisfies Meta<typeof StableLinearProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

function ProgressDemo({ children }: { children: React.ReactNode }) {
  return <Box sx={{ width: 360, p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>{children}</Box>;
}

export const Default: Story = {
  render: (args) => {
    const [active, setActive] = useState(false);

    return (
      <Stack spacing={2}>
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setActive((v) => !v)}
        >
          {active ? 'Hide' : 'Show'} progress
        </Button>
        <ProgressDemo>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reserves layout space — opacity fades in/out without shifting content below.
          </Typography>
          <StableLinearProgress {...args} active={active} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Content below stays put when the bar appears.
          </Typography>
        </ProgressDemo>
      </Stack>
    );
  },
};

export const NavigationTiming: Story = {
  render: (args) => {
    const [active, setActive] = useState(false);
    const tokens = resolveSmoothMotionTokens();

    return (
      <Stack spacing={2}>
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setActive((v) => !v)}
        >
          {active ? 'Finish navigation' : 'Start navigation'}
        </Button>
        <ProgressDemo>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Same motion tokens as BusyArea — fixed below app bar in NavigationBusyOverlay
          </Typography>
          <StableLinearProgress
            {...args}
            active={active}
            transitionMs={tokens.transitionMs}
            transitionEasing={tokens.transitionEasing}
            aria-label="Loading page"
          />
        </ProgressDemo>
      </Stack>
    );
  },
};

export const CatalogToolbar: Story = {
  render: (args) => {
    const [active, setActive] = useState(false);

    return (
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setActive((v) => !v)}
        >
          {active ? 'Finish refetch' : 'Simulate refetch'}
        </Button>
        <Stack spacing={0.75}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {active ? 'Searching…' : '24 products'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sort
            </Typography>
          </Stack>
          <StableLinearProgress {...args} active={active} aria-label="Searching catalog" />
        </Stack>
      </Stack>
    );
  },
};

export const CustomHeight: Story = {
  args: { height: 4, active: true },
};
