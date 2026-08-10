'use client';

import { captureException } from '@my-noodles/web-lib/sentry';
import { useEffect } from 'react';

import { ErrorScreen } from '@/screens/error';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return <ErrorScreen reset={reset} />;
}
