import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { InlineEditableNumber } from '../components/InlineEditableNumber';

const meta = {
  title: 'Components/InlineEditableNumber',
  component: InlineEditableNumber,
  parameters: {
    docs: {
      description: {
        component:
          'Click-to-edit non-negative integer. Confirm/cancel via icons or Enter/Escape; blur cancels. Apps confirm side effects (e.g. stock change) outside this control.',
      },
    },
  },
} satisfies Meta<typeof InlineEditableNumber>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicDemo() {
  const [quantity, setQuantity] = useState(12);
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Quantity
        </Typography>
        <InlineEditableNumber
          value={quantity}
          onSubmitRequest={(next) => {
            setLastSubmitted(next);
            setQuantity(next);
          }}
          ariaLabel="Edit quantity"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
        />
      </Stack>
      {lastSubmitted != null ? (
        <Typography variant="caption" color="text.secondary">
          Last submit: {lastSubmitted}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Click the number to edit.
        </Typography>
      )}
    </Stack>
  );
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};

function DisabledDemo() {
  return (
    <InlineEditableNumber
      value={4}
      onSubmitRequest={() => undefined}
      disabled
      ariaLabel="Edit quantity"
      confirmLabel="Confirm"
      cancelLabel="Cancel"
    />
  );
}

export const Disabled: Story = {
  render: () => <DisabledDemo />,
};

function ConfirmBeforeCommitDemo() {
  const [quantity, setQuantity] = useState(24);
  const [pending, setPending] = useState<number | null>(null);

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Stock
        </Typography>
        <InlineEditableNumber
          value={quantity}
          onSubmitRequest={(next) => setPending(next)}
          ariaLabel="Edit stock"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
        />
      </Stack>
      {pending != null ? (
        <Stack spacing={0.5}>
          <Typography variant="body2">
            Change stock from {quantity} to {pending}?
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setQuantity(pending);
                setPending(null);
              }}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}

export const ConfirmBeforeCommit: Story = {
  name: 'Confirm before commit',
  parameters: {
    docs: {
      description: {
        story:
          'Admin stock pattern: `onSubmitRequest` only proposes a value; the host modal/flow commits after confirmation.',
      },
    },
  },
  render: () => <ConfirmBeforeCommitDemo />,
};
