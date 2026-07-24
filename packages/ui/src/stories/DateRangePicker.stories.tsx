import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { useState } from 'react';

import { DateRangePicker, type DatePreset, type DateRange } from '../components/DatePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    docs: {
      description: {
        component:
          'Draft calendar panel for selecting a date range. Commit with Apply; wrap in a Popover/Menu at the call site.',
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const sharedLabels = {
  applyLabel: 'Apply',
  fromLabel: 'From',
  toLabel: 'To',
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
} as const;

const presetGroups: DatePreset[][] = [
  [
    {
      id: 'last7',
      label: 'Last 7 days',
      getValue: () => ({
        from: dayjs().subtract(6, 'day').startOf('day').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
    {
      id: 'last30',
      label: 'Last 30 days',
      getValue: () => ({
        from: dayjs().subtract(29, 'day').startOf('day').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
    {
      id: 'thisMonth',
      label: 'This month',
      getValue: () => ({
        from: dayjs().startOf('month').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
  ],
];

function ControlledDemo({
  presets,
  locale,
  disabled,
}: {
  presets?: DatePreset[][];
  locale?: 'uk' | 'en';
  disabled?: boolean;
}) {
  const [value, setValue] = useState<DateRange | undefined>({
    from: dayjs().subtract(6, 'day').toDate(),
    to: dayjs().toDate(),
  });

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Applied:{' '}
        {value
          ? `${dayjs(value.from).format('DD.MM.YYYY')} – ${dayjs(value.to).format('DD.MM.YYYY')}`
          : 'none'}
      </Typography>
      <Paper variant="outlined" sx={{ width: 'fit-content' }}>
        <DateRangePicker
          {...sharedLabels}
          value={value}
          locale={locale}
          presets={presets}
          disabled={disabled}
          onApply={setValue}
        />
      </Paper>
    </Stack>
  );
}

export const Basic: Story = {
  args: {
    ...sharedLabels,
    onApply: () => undefined,
  },
  render: () => <ControlledDemo />,
};

export const WithPresets: Story = {
  args: {
    ...sharedLabels,
    onApply: () => undefined,
  },
  render: () => <ControlledDemo presets={presetGroups} />,
};

export const EnglishLocale: Story = {
  args: {
    ...sharedLabels,
    onApply: () => undefined,
  },
  render: () => <ControlledDemo locale="en" presets={presetGroups} />,
};

export const MinMax: Story = {
  args: {
    ...sharedLabels,
    onApply: () => undefined,
  },
  render: function MinMaxDemo() {
    const [value, setValue] = useState<DateRange | undefined>();
    const minDate = dayjs().subtract(14, 'day').toDate();
    const maxDate = dayjs().toDate();

    return (
      <Box>
        <Paper variant="outlined" sx={{ width: 'fit-content' }}>
          <DateRangePicker
            {...sharedLabels}
            value={value}
            minDate={minDate}
            maxDate={maxDate}
            onApply={setValue}
          />
        </Paper>
      </Box>
    );
  },
};

export const Disabled: Story = {
  args: {
    ...sharedLabels,
    onApply: () => undefined,
  },
  render: () => <ControlledDemo disabled />,
};
