import { supportControllerOpenSession } from '@my-noodles/api-clients/storefront';
import { mutationOptions } from '@tanstack/react-query';

export const supportMutations = {
  rootKey: ['support'] as const,
  openSession: () =>
    mutationOptions({
      mutationKey: [...supportMutations.rootKey, 'openSession'] as const,
      mutationFn: () => supportControllerOpenSession(),
    }),
};
