'use client';

import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { feedQueries, feedQueryKeys, likeFeedProduct, unlikeFeedProduct } from './feed';

export function useLikeFeedProduct() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: likeFeedProduct,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: feedQueryKeys.likes() });
      },
    }),
    'likeFeed',
  );
}

export function useUnlikeFeedProduct() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: unlikeFeedProduct,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: feedQueryKeys.likes() });
      },
    }),
    'unlikeFeed',
  );
}

export function useFeedLikes(options?: { enabled?: boolean }) {
  return formatUseQuery(
    useQuery({
      ...feedQueries.likes(),
      enabled: options?.enabled ?? true,
    }),
    'feedLikes',
  );
}

export function useFeedComments(productId: string | null, options?: { enabled?: boolean }) {
  return formatUseQuery(
    useQuery({
      ...feedQueries.comments(productId ?? ''),
      enabled: (options?.enabled ?? true) && Boolean(productId),
    }),
    'feedComments',
  );
}
