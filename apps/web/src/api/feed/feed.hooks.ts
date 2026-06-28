'use client';

import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { feedQueryKeys, fetchFeedComments, fetchFeedLikes, likeFeedProduct, unlikeFeedProduct } from './feed';

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
      queryKey: feedQueryKeys.likes(),
      queryFn: fetchFeedLikes,
      enabled: options?.enabled ?? true,
      placeholderData: undefined,
    }),
    'feedLikes',
  );
}

export function useFeedComments(productId: string | null, options?: { enabled?: boolean }) {
  return formatUseQuery(
    useQuery({
      queryKey: feedQueryKeys.comments(productId ?? ''),
      queryFn: () => fetchFeedComments(productId ?? ''),
      enabled: (options?.enabled ?? true) && Boolean(productId),
      placeholderData: undefined,
    }),
    'feedComments',
  );
}
