'use client';

import { useModalContext } from './modal-context';

export type UseModalResult<T = void> = {
  isOpen: boolean;
  data: T;
  close: () => void;
  disableClose: boolean;
  setDisableClose: (disabled: boolean) => void;
};

export function useModal<T = void>(): UseModalResult<T> {
  const { isOpen, data, close, disableClose, setDisableClose } = useModalContext();

  return {
    isOpen,
    data: data as T,
    close,
    disableClose,
    setDisableClose,
  };
}
