'use client';

import { lazy, Suspense } from 'react';

const ReactQueryDevtoolsPanel = lazy(() =>
  import('@tanstack/react-query-devtools').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

export function ReactQueryDevtools() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtoolsPanel initialIsOpen={false} buttonPosition="bottom-left" />
    </Suspense>
  );
}
