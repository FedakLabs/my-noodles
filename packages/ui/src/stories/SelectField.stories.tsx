import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SelectField } from '../components/SelectField';

const meta = {
  title: 'Components/SelectField',
  component: SelectField,
  parameters: {
    docs: {
      description: {
        component:
          'Outlined MUI select with reliable label notch shrink. Use for filters and forms; pass `MenuItem` children like a normal `TextField select`.',
      },
    },
  },
} satisfies Meta<typeof SelectField>;

export default meta;

type Story = StoryObj<typeof meta>;

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'sent', label: 'Sent' },
  { value: 'completed', label: 'Completed' },
] as const;

function BasicDemo() {
  const [value, setValue] = useState('new');

  return (
    <Stack spacing={1} sx={{ maxWidth: 280 }}>
      <SelectField
        label="Status"
        size="small"
        width={220}
        value={value}
        onChange={(event) => setValue(String(event.target.value))}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SelectField>
      <Typography variant="body2" color="text.secondary">
        Selected: {value}
      </Typography>
    </Stack>
  );
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};

function MultiSelectWithEmptyDemo() {
  const [statuses, setStatuses] = useState<string[]>([]);

  return (
    <Stack spacing={1} sx={{ maxWidth: 320 }}>
      <SelectField
        label="Status"
        size="small"
        width={260}
        visuallyFilledWhenEmpty
        value={statuses}
        onChange={(event) => {
          const next = event.target.value;
          setStatuses(typeof next === 'string' ? next.split(',') : next);
        }}
        slotProps={{
          select: {
            multiple: true,
            displayEmpty: true,
            renderValue: (selected) => {
              const values = selected as string[];
              if (values.length === 0) {
                return 'All statuses';
              }
              return values
                .map((value) => STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value)
                .join(', ');
            },
          },
        }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SelectField>
      <Typography variant="body2" color="text.secondary">
        Filter: {statuses.length === 0 ? 'all' : statuses.join(', ')}
      </Typography>
    </Stack>
  );
}

export const MultiSelectWithEmpty: Story = {
  name: 'Multi-select with empty placeholder',
  parameters: {
    docs: {
      description: {
        story:
          'Admin filter pattern: `visuallyFilledWhenEmpty` + `displayEmpty` keeps the label shrunk when “All” is shown.',
      },
    },
  },
  render: () => <MultiSelectWithEmptyDemo />,
};
