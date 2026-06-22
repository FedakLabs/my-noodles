'use client';

import { useEffect, useMemo, useTransition } from 'react';

import { useRouter } from '@/i18n/navigation';

import { useNavigationPendingActions } from './navigation-pending-context';

export function usePendingRouter() {
  const router = useRouter();
  const { registerTransitionPending } = useNavigationPendingActions();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    registerTransitionPending(isPending);
    return () => registerTransitionPending(false);
  }, [isPending, registerTransitionPending]);

  return useMemo(
    () => ({
      ...router,
      push: (...args: Parameters<typeof router.push>) => {
        startTransition(() => {
          router.push(...args);
        });
      },
      replace: (...args: Parameters<typeof router.replace>) => {
        startTransition(() => {
          router.replace(...args);
        });
      },
    }),
    [router, startTransition],
  );
}
