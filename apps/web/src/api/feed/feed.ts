import {
  type FeedProductComment,
  feedControllerComments,
  feedControllerLike,
  feedControllerLikes,
  feedControllerNext,
  feedControllerUnlike,
  type FeedLikeStateDto,
  type FeedNextDto,
  type FeedNextResponseDto,
  type Product,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';
import { queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

const feedQueryKeyRoot = ['feed'] as const;

export const feedQueryKeys = {
  all: withAppLocaleKey(() => feedQueryKeyRoot),
  likes: withAppLocaleKey(() => [...feedQueryKeyRoot, 'likes'] as const),
  comments: withAppLocaleKey((productId: string) => [...feedQueryKeyRoot, 'comments', productId] as const),
};

export async function fetchFeedNext(body: FeedNextDto): Promise<FeedNextResponseDto> {
  return await requestData(feedControllerNext({ body }));
}

export async function likeFeedProduct(productId: string): Promise<FeedLikeStateDto> {
  return await requestData(feedControllerLike({ path: { productId } }));
}

export async function unlikeFeedProduct(productId: string): Promise<FeedLikeStateDto> {
  return await requestData(feedControllerUnlike({ path: { productId } }));
}

export async function fetchFeedComments(productId: string): Promise<FeedProductComment[]> {
  return await requestData(feedControllerComments({ path: { productId } }));
}

export async function fetchFeedLikes(): Promise<Product[]> {
  return await requestData(feedControllerLikes());
}

export const feedQueries = {
  likes: () =>
    queryOptions({
      queryKey: feedQueryKeys.likes(),
      queryFn: fetchFeedLikes,
      placeholderData: undefined,
    }),
  comments: (productId: string) =>
    queryOptions({
      queryKey: feedQueryKeys.comments(productId),
      queryFn: () => fetchFeedComments(productId),
      placeholderData: undefined,
    }),
};
