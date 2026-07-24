import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { useState } from 'react';

import { DateSinglePicker } from '../components/DatePicker';

const meta = {
  title: 'Components/DateSinglePicker',
  component: DateSinglePicker,
  parameters: {
    docs: {
      description: {
        component: 'Immediate single-date calendar panel. Selection commits on click.',
      },
    },
  },
} satisfies Meta<typeof DateSinglePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const sharedLabels = {
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
} as const;

function ControlledDemo({
  locale,
  minDate,
  maxDate,
  disabled,
}: {
  locale?: 'uk' | 'en';
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<Date | undefined>(dayjs().toDate());

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Selected: {value ? dayjs(value).format('DD.MM.YYYY') : 'none'}
      </Typography>
      <Paper variant="outlined" sx={{ width: 'fit-content' }}>
        <DateSinglePicker
          {...sharedLabels}
          value={value}
          locale={locale}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          onChange={setValue}
        />
      </Paper>
    </Stack>
  );
}

export const Basic: Story = {
  args: {
    ...sharedLabels,
    onChange: () => undefined,
  },
  render: () => <ControlledDemo />,
};

export const EnglishLocale: Story = {
  args: {
    ...sharedLabels,
    onChange: () => undefined,
  },
  render: () => <ControlledDemo locale="en" />,
};

export const MinMax: Story = {
  args: {
    ...sharedLabels,
    onChange: () => undefined,
  },
  render: () => (
    <ControlledDemo minDate={dayjs().subtract(7, 'day').toDate()} maxDate={dayjs().add(7, 'day').toDate()} />
  ),
};

export const Disabled: Story = {
  args: {
    ...sharedLabels,
    onChange: () => undefined,
  },
  render: () => <ControlledDemo disabled />,
};
