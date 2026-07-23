import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CurrencySelect } from '../components/CurrencySelect';

const meta = {
  title: 'Components/CurrencySelect',
  component: CurrencySelect,
  parameters: {
    docs: {
      description: {
        component:
          'Thin `SelectField` wrapper for ISO currency codes. Defaults to UAH/USD; pass `currencies` from the app when the list differs.',
      },
    },
  },
} satisfies Meta<typeof CurrencySelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicDemo() {
  const [currency, setCurrency] = useState('UAH');

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <CurrencySelect value={currency} onChange={setCurrency} size="small" />
      <Typography variant="body2" color="text.secondary">
        Selected: {currency}
      </Typography>
    </Stack>
  );
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};

function CustomCurrenciesDemo() {
  const [currency, setCurrency] = useState('EUR');

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <CurrencySelect
        value={currency}
        onChange={setCurrency}
        currencies={['EUR', 'GBP', 'JPY'] as const}
        label="Checkout currency"
        width={160}
      />
      <Typography variant="body2" color="text.secondary">
        Selected: {currency}
      </Typography>
    </Stack>
  );
}

export const CustomCurrencies: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pass an explicit `currencies` list when the app supports more than the default codes.',
      },
    },
  },
  render: () => <CustomCurrenciesDemo />,
};
