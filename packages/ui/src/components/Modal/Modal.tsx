'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import {
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { ModalContext, type ModalContextValue } from './modal-context';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';
import { ModalScrollable } from './ModalScrollable';

export type ModalMaxWidth = 'sm' | 'md' | 'lg' | 'xl';

export type ModalRef<T = void> = {
  open: [T] extends [void] ? () => void : (data: T) => void;
  close: () => void;
};

export type ModalProps<T = void> = {
  children: ReactNode;
  ref?: Ref<ModalRef<T>>;
  maxWidth?: ModalMaxWidth;
  disableClose?: boolean;
  onClose?: () => void;
};

function ModalRoot({
  children,
  ref,
  maxWidth = 'sm',
  disableClose: disableCloseProp = false,
  onClose,
}: ModalProps<unknown>) {
  const theme = useTheme();
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<unknown>(undefined);
  const [disableCloseInternal, setDisableCloseInternal] = useState(false);

  const disableClose = disableCloseProp || disableCloseInternal;

  const setDisableClose = useCallback((disabled: boolean) => {
    setDisableCloseInternal(disabled);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setDisableCloseInternal(false);
    onClose?.();
  }, [onClose]);

  useImperativeHandle(
    ref,
    () =>
      ({
        open: (payload?: unknown) => {
          setDisableCloseInternal(false);
          setData(payload);
          setIsOpen(true);
        },
        close,
      }) as ModalRef<unknown>,
    [close],
  );

  const handleDialogClose = useCallback(() => {
    if (disableClose) {
      return;
    }
    close();
  }, [close, disableClose]);

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      isOpen,
      data,
      close,
      disableClose,
      setDisableClose,
      titleId,
    }),
    [close, data, disableClose, isOpen, setDisableClose, titleId],
  );

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      fullWidth
      maxWidth={false}
      aria-labelledby={titleId}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: theme.modalWidths[maxWidth],
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <ModalContext.Provider value={contextValue}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            maxHeight: '100%',
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      </ModalContext.Provider>
    </Dialog>
  );
}

type ModalComponent = (<T = void>(props: ModalProps<T>) => ReactElement | null) & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  Scrollable: typeof ModalScrollable;
};

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Scrollable: ModalScrollable,
}) as ModalComponent;
