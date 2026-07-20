'use client';

import { useCallback, useRef } from 'react';

import { useNavigationPendingActions, useNavigationRawPending } from '@/hooks/smooth';
import { LOCALE_OPTIONS } from '@/i18n/locales';
import type { AppLocale } from '@/i18n/routing';

import { useAppLocale, useLocaleStore } from './locale-store';

export function useSwitchLocale() {
  const locale = useAppLocale();
  const storeSwitchLocale = useLocaleStore((state) => state.switchLocale);
  const { registerTransitionPending } = useNavigationPendingActions();
  const isSwitching = useNavigationRawPending();
  const switchStartedRef = useRef(false);

  const switchLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale || switchStartedRef.current || isSwitching) {
        return;
      }

      switchStartedRef.current = true;
      registerTransitionPending(true);
      storeSwitchLocale(next);
    },
    [isSwitching, locale, registerTransitionPending, storeSwitchLocale],
  );

  return { locale, isSwitching, switchLocale, options: LOCALE_OPTIONS };
}
