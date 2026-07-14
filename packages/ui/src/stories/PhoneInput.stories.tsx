import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { PhoneInput } from '../components/PhoneInput';

const meta = {
  title: 'Components/PhoneInput',
  component: PhoneInput,
  args: {
    label: 'Phone',
    fullWidth: true,
  },
} satisfies Meta<typeof PhoneInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledPhoneInput(args: Story['args']) {
  const [value, setValue] = useState('');

  return (
    <Stack spacing={1} sx={{ width: 360 }}>
      <PhoneInput {...args} value={value} onChange={setValue} />
      <Typography variant="caption" color="text.secondary">
        Stored value: {value || '—'}
      </Typography>
    </Stack>
  );
}

export const Medium: Story = {
  args: { size: 'medium' },
  render: (args) => <ControlledPhoneInput {...args} />,
};

export const Large: Story = {
  args: { size: 'large' },
  render: (args) => <ControlledPhoneInput {...args} />,
};

export const WithValue: Story = {
  args: { size: 'large' },
  render: (args) => {
    const [value, setValue] = useState('+380501112233');

    return (
      <Stack spacing={1} sx={{ width: 360 }}>
        <PhoneInput {...args} value={value} onChange={setValue} />
        <Typography variant="caption" color="text.secondary">
          Stored value: {value}
        </Typography>
      </Stack>
    );
  },
};
