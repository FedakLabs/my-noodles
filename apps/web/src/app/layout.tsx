import '@my-noodles/theme/fonts.css';
import '@my-noodles/theme/fonts.local.css';
import '@/i18n/global';
import '@/api/clients';
import '@/api/register-app-locale.server';

import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
