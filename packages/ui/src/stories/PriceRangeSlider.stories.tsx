import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PriceRangeSlider } from '../components/PriceRangeSlider';

const meta = {
  title: 'Components/PriceRangeSlider',
  component: PriceRangeSlider,
  args: {
    min: 0,
    max: 500,
    label: 'Price',
    minLabel: 'From',
    maxLabel: 'To',
  },
} satisfies Meta<typeof PriceRangeSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledSlider(args: Story['args']) {
  const [value, setValue] = useState<[number, number]>([50, 300]);
  return <PriceRangeSlider {...args} value={value} onCommit={setValue} />;
}

export const Default: Story = {
  render: (args) => <ControlledSlider {...args} />,
};

export const NarrowBounds: Story = {
  args: { min: 100, max: 120 },
  render: (args) => <ControlledSlider {...args} />,
};

export const EqualBoundsHidden: Story = {
  args: { min: 200, max: 200 },
  render: (args) => (
    <Stack spacing={1}>
      <PriceRangeSlider {...args} value={[200, 200]} onCommit={() => undefined} />
      <em>Nothing renders when max ≤ min.</em>
    </Stack>
  ),
};
