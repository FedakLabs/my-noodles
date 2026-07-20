import {
  feedControllerComments,
  feedControllerLike,
  feedControllerLikes,
  feedControllerNext,
  feedControllerUnlike,
  type FeedNextDto,
} from '@my-noodles/api-clients/storefront';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export const feedQueries = {
  rootKey: ['feed'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => feedQueries.rootKey)(),
    }),
  likes: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...feedQueries.rootKey, 'likes'] as const)(),
      queryFn: () => feedControllerLikes(),
      placeholderData: undefined,
    }),
  comments: (productId: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...feedQueries.rootKey, 'comments', productId] as const)(),
      queryFn: () => feedControllerComments({ path: { productId } }),
      placeholderData: undefined,
    }),
};

export const feedMutations = {
  rootKey: feedQueries.rootKey,
  next: () =>
    mutationOptions({
      mutationKey: [...feedMutations.rootKey, 'next'] as const,
      mutationFn: (body: FeedNextDto) => feedControllerNext({ body }),
    }),
  like: () =>
    mutationOptions({
      mutationKey: [...feedMutations.rootKey, 'like'] as const,
      mutationFn: (productId: string) => feedControllerLike({ path: { productId } }),
    }),
  unlike: () =>
    mutationOptions({
      mutationKey: [...feedMutations.rootKey, 'unlike'] as const,
      mutationFn: (productId: string) => feedControllerUnlike({ path: { productId } }),
    }),
};
