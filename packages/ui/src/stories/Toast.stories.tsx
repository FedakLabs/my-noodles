import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { showToast, ToastProvider } from '../components/Toast';

const meta = {
  title: 'Components/Toast',
  parameters: {
    docs: {
      description: {
        component:
          'Sonner-based toasts themed for My Noodles. Mount `ToastProvider` once near the app root, then call `showToast.*` from anywhere.',
      },
    },
  },
  decorators: [
    (Story) => (
      <>
        <ToastProvider />
        <Story />
      </>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function VariantsDemo() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="body2" color="text.secondary">
        Fire a toast — it appears bottom-right via `ToastProvider`.
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button variant="outlined" size="small" onClick={() => showToast.success('Link copied')}>
          Success
        </Button>
        <Button variant="outlined" size="small" onClick={() => showToast.error('Could not copy link')}>
          Error
        </Button>
        <Button variant="outlined" size="small" onClick={() => showToast.info('Saved as draft')}>
          Info
        </Button>
        <Button variant="outlined" size="small" onClick={() => showToast.warning('Low stock')}>
          Warning
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            const id = showToast.loading('Saving…');
            window.setTimeout(() => {
              showToast.dismiss(id);
              showToast.success('Saved');
            }, 1200);
          }}
        >
          Loading → success
        </Button>
      </Stack>
    </Stack>
  );
}

export const Variants: Story = {
  render: () => <VariantsDemo />,
};

function PromiseDemo() {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          void showToast.promise(
            new Promise<string>((resolve) => {
              window.setTimeout(() => resolve('ord_123'), 1400);
            }),
            {
              loading: 'Placing order…',
              success: (id) => `Order ${id} placed`,
              error: 'Checkout failed',
            },
          );
        }}
      >
        Promise toast
      </Button>
      <Typography variant="caption" color="text.secondary">
        `showToast.promise` wires loading / success / error from one async call.
      </Typography>
    </Stack>
  );
}

export const PromiseToast: Story = {
  name: 'Promise',
  render: () => <PromiseDemo />,
};
