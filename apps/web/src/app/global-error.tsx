'use client';

import { captureException } from '@my-noodles/web-lib/sentry';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Root fallback — must render its own html/body (Next.js requirement). */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="uk">
      <body>
        <main style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Щось пішло не так</h1>
          <p style={{ color: '#555', marginBottom: '1.25rem' }}>
            Сталася неочікувана помилка. Спробуйте ще раз.
          </p>
          <button type="button" onClick={reset}>
            Спробувати ще
          </button>
        </main>
      </body>
    </html>
  );
}
