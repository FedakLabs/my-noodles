'use client';

import { createContext, useContext } from 'react';

export type ModalContextValue = {
  isOpen: boolean;
  data: unknown;
  close: () => void;
  disableClose: boolean;
  setDisableClose: (disabled: boolean) => void;
  titleId: string;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('Modal compound components must be used within Modal');
  }

  return context;
}
