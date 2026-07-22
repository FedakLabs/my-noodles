import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyableField } from '../components/CopyableField';

const meta = {
  title: 'Components/CopyableField',
  component: CopyableField,
} satisfies Meta<typeof CopyableField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ValueOnly: Story = {
  args: {
    value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Phone',
    value: '+380501112233',
  },
};

export const Truncated: Story = {
  render: () => (
    <Stack spacing={1} sx={{ maxWidth: 220 }}>
      <CopyableField
        label="Order"
        value={{ text: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', sx: { maxWidth: 140 } }}
      />
    </Stack>
  ),
};

export const Empty: Story = {
  args: {
    label: 'Phone',
    value: '',
  },
};
