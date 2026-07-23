'use client';

import { createContext, useContext } from 'react';

import type { LocalizedTextFieldLocaleOption } from './LocalizedTextField';

export type LocalizedFieldsContextValue = {
  activeLocale: string;
  setActiveLocale: (locale: string) => void;
  locales: readonly LocalizedTextFieldLocaleOption[];
  disabled: boolean;
};

export const LocalizedFieldsContext = createContext<LocalizedFieldsContextValue | null>(null);

export function useLocalizedFieldsContext(): LocalizedFieldsContextValue | null {
  return useContext(LocalizedFieldsContext);
}
