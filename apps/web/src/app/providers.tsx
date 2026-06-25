'use client';

import '@/api/clients';
import '@/api/register-app-locale.client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { theme } from '@my-noodles/theme';
import { ToastProvider } from '@my-noodles/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type ReactNode, useState } from 'react';

import { ReactQueryDevtools } from '@/components/dev/react-query-devtools';
import { LocaleSync } from '@/hooks/locale';
import type { AppLocale } from '@/i18n/routing';
import { getQueryClient } from '@/shared/query-client';

type ProvidersProps = {
  children: ReactNode;
  locale: AppLocale;
};

export function Providers({ children, locale }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <NuqsAdapter>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider />
          <QueryClientProvider client={queryClient}>
            <LocaleSync locale={locale} />
            {children}
            <ReactQueryDevtools />
          </QueryClientProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </NuqsAdapter>
  );
}
