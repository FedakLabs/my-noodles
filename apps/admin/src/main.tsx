import '@my-noodles/theme/fonts.css';
import { SentryErrorBoundary } from '@my-noodles/web-lib/sentry';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/shared/sentry';
import '@/i18n/i18n';
import { Providers } from '@/providers';
import { router } from '@/router/router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <SentryErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </SentryErrorBoundary>
  </StrictMode>,
);
