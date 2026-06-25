import {
  type FeedCommentDto,
  feedControllerComments,
  feedControllerLike,
  feedControllerLikes,
  feedControllerNext,
  feedControllerUnlike,
  type FeedLikedItemDto,
  type FeedLikeStateDto,
  type FeedNextDto,
  type FeedNextResponseDto,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

import { withAppLocaleKey } from '@/shared/app-locale';

const feedQueryKeyRoot = ['feed'] as const;

export const feedQueryKeys = {
  all: withAppLocaleKey(() => feedQueryKeyRoot),
  likes: withAppLocaleKey(() => [...feedQueryKeyRoot, 'likes'] as const),
  comments: withAppLocaleKey((productId: string) => [...feedQueryKeyRoot, 'comments', productId] as const),
};

export async function fetchFeedNext(body: FeedNextDto): Promise<FeedNextResponseDto> {
  return requestData(feedControllerNext({ body }));
}

export async function likeFeedProduct(productId: string): Promise<FeedLikeStateDto> {
  return requestData(feedControllerLike({ path: { productId } }));
}

export async function unlikeFeedProduct(productId: string): Promise<FeedLikeStateDto> {
  return requestData(feedControllerUnlike({ path: { productId } }));
}

export async function fetchFeedComments(productId: string): Promise<FeedCommentDto[]> {
  return requestData(feedControllerComments({ path: { productId } }));
}

export async function fetchFeedLikes(): Promise<FeedLikedItemDto[]> {
  return requestData(feedControllerLikes());
}
