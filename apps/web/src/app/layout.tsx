import '@my-noodles/theme/fonts.css';

import type { Metadata } from 'next';

import { manrope, unbounded } from './fonts';

export const metadata: Metadata = {
  title: 'my-noodles',
  description: 'Food-discovery store for imported snacks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${manrope.variable} ${unbounded.variable}`}>
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
