import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SearchField } from '../components/SearchField';

const meta = {
  title: 'Components/SearchField',
  component: SearchField,
  parameters: {
    docs: {
      description: {
        component: 'United search control: field select + text input. Controlled; no URL/i18n wiring.',
      },
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

const FIELDS = [
  { value: 'slug', label: 'Slug' },
  { value: 'name', label: 'Name' },
];

function BasicDemo() {
  const [field, setField] = useState('slug');
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Stack spacing={1} sx={{ maxWidth: 480 }}>
      <SearchField
        fields={FIELDS}
        field={field}
        onFieldChange={setField}
        value={value}
        onValueChange={setValue}
        onSubmit={() => setSubmitted(`${field}=${value}`)}
        fieldLabel="Search by"
        label="Search"
      />
      {submitted ? (
        <Typography variant="body2" color="text.secondary">
          Submitted: {submitted}
        </Typography>
      ) : null}
    </Stack>
  );
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};
