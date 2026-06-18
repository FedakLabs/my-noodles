import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'my-noodles',
  description: 'Food-discovery store for imported snacks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
