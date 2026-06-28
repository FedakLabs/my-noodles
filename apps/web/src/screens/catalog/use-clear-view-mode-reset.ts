import { useEffect } from 'react';

type UseClearViewModeResetOptions = {
  isViewModeResetting: boolean;
  clearViewModeReset: () => void;
  productsIsBusy: boolean;
  itemCount: number;
  isError: boolean;
};

export function useClearViewModeReset({
  isViewModeResetting,
  clearViewModeReset,
  productsIsBusy,
  itemCount,
  isError,
}: UseClearViewModeResetOptions) {
  useEffect(() => {
    if (!isViewModeResetting) {
      return;
    }

    if (!productsIsBusy && (itemCount > 0 || isError)) {
      clearViewModeReset();
    }
  }, [clearViewModeReset, isError, isViewModeResetting, itemCount, productsIsBusy]);
}
