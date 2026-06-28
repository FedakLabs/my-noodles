import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { Preview } from '@storybook/react-vite';

import '@my-noodles/theme/fonts.css';
import '@my-noodles/theme/fonts.local.css';
import { MyNoodlesTheme } from '@my-noodles/theme';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={MyNoodlesTheme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
