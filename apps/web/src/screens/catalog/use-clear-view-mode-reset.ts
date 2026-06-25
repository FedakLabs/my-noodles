import { useEffect } from 'react';

type UseClearViewModeResetOptions = {
  isViewModeResetting: boolean;
  clearViewModeReset: () => void;
  productsIsBusy: boolean;
  itemCount: number;
  isLoadFailed: boolean;
};

export function useClearViewModeReset({
  isViewModeResetting,
  clearViewModeReset,
  productsIsBusy,
  itemCount,
  isLoadFailed,
}: UseClearViewModeResetOptions) {
  useEffect(() => {
    if (!isViewModeResetting) {
      return;
    }

    if (!productsIsBusy && (itemCount > 0 || isLoadFailed)) {
      clearViewModeReset();
    }
  }, [clearViewModeReset, isLoadFailed, isViewModeResetting, itemCount, productsIsBusy]);
}
