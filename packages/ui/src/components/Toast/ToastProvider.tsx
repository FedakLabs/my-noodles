'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import { Toaster } from 'sonner';

import { toastGlobalStyles } from './toast-global-styles';

export function ToastProvider() {
  return (
    <>
      <GlobalStyles styles={toastGlobalStyles} />
      <Toaster
        position="bottom-right"
        expand
        richColors={false}
        closeButton
        offset={16}
        gap={10}
        visibleToasts={5}
        style={{ zIndex: 1400 }}
        toastOptions={{
          classNames: {
            toast: 'noodles-toast',
          },
        }}
      />
    </>
  );
}
