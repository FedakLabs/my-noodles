import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LOCALE_OPTIONS } from '@my-noodles/locale';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  LocalizedFields,
  LocalizedTextField,
  type LocalizedTextFieldValue,
} from '../components/LocalizedTextField';

const meta = {
  title: 'Components/LocalizedTextField',
  component: LocalizedTextField,
  parameters: {
    docs: {
      description: {
        component:
          'Text field with a per-locale value map. Standalone: locale switcher in the adornment. Inside `LocalizedFields`: one shared locale selector for a group of fields.',
      },
    },
  },
} satisfies Meta<typeof LocalizedTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

function StandaloneDemo() {
  const [name, setName] = useState<LocalizedTextFieldValue>({
    uk: 'Булдак Карбонара',
    en: 'Buldak Carbonara',
  });

  return (
    <Stack spacing={1} sx={{ maxWidth: 420 }}>
      <LocalizedTextField label="Name" value={name} onChange={setName} required locales={LOCALE_OPTIONS} />
      <Typography
        variant="caption"
        color="text.secondary"
        component="pre"
        sx={{ m: 0, whiteSpace: 'pre-wrap' }}
      >
        {JSON.stringify(name, null, 2)}
      </Typography>
    </Stack>
  );
}

export const Standalone: Story = {
  render: () => <StandaloneDemo />,
};

function SharedLocaleGroupDemo() {
  const [name, setName] = useState<LocalizedTextFieldValue>({
    uk: 'Булдак Карбонара',
    en: 'Buldak Carbonara',
  });
  const [story, setStory] = useState<LocalizedTextFieldValue>({
    uk: 'Вершкова карбонара з гострим курячим бульйоном.',
    en: 'A creamy carbonara twist on fire noodles.',
  });
  const [description, setDescription] = useState<LocalizedTextFieldValue>({
    uk: '',
    en: '',
  });

  return (
    <Stack spacing={1} sx={{ maxWidth: 480 }}>
      <LocalizedFields localeLabel="Language" locales={LOCALE_OPTIONS}>
        <LocalizedTextField label="Name" value={name} onChange={setName} required />
        <LocalizedTextField label="Story" value={story} onChange={setStory} multiline minRows={2} />
        <LocalizedTextField
          label="Description"
          value={description}
          onChange={setDescription}
          multiline
          minRows={3}
        />
      </LocalizedFields>
      <Typography variant="caption" color="text.secondary">
        Nested fields hide their own locale selects and follow the shared language control.
      </Typography>
    </Stack>
  );
}

export const SharedLocaleGroup: Story = {
  name: 'Shared locale group',
  parameters: {
    docs: {
      description: {
        story: 'Admin form pattern: wrap related localized inputs in `LocalizedFields`.',
      },
    },
  },
  render: () => <SharedLocaleGroupDemo />,
};
