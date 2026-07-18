import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';

import type { QueryViewState, QueryViewStateKeyMap } from './query-view-state';
import { deriveQueryViewState } from './query-view-state';

type RenameKey<T, From extends PropertyKey, To extends PropertyKey> = {
  [K in keyof T as K extends From ? To : K]: T[K];
};

export type RenameMultiple<T, R extends [PropertyKey, PropertyKey][]> = R extends [infer First, ...infer Rest]
  ? First extends [infer From extends PropertyKey, infer To extends PropertyKey]
    ? Rest extends [PropertyKey, PropertyKey][]
      ? RenameMultiple<RenameKey<T, From, To>, Rest>
      : RenameKey<T, From, To>
    : never
  : T;

/** Page-based list responses from our API (`PaginatedProductsDto`, …). */
export type PagePaginatedResponse<TItem> = {
  items: TItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export function pagePaginatedGetNextPageParam<TItem>() {
  return (lastPage: PagePaginatedResponse<TItem> | undefined): number | undefined => {
    if (!lastPage) {
      return 1;
    }

    const { page, limit, total } = lastPage.meta;
    return page * limit < total ? page + 1 : undefined;
  };
}

export function formatUseMutation<TData, TError, TVariables, TContext, MutationName extends string>(
  {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
    variables,
  }: UseMutationResult<TData, TError, TVariables, TContext>,
  mutationName: MutationName,
): RenameMultiple<
  UseMutationResult<TData, TError, TVariables, TContext>,
  [
    ['mutate', `${MutationName}`],
    ['mutateAsync', `${MutationName}Async`],
    ['reset', `${MutationName}Reset`],
    ['isPending', `${MutationName}IsPending`],
    ['isSuccess', `${MutationName}IsSuccess`],
    ['isError', `${MutationName}IsError`],
    ['error', `${MutationName}Error`],
    ['data', `${MutationName}Data`],
    ['variables', `${MutationName}Variables`],
  ]
> {
  return {
    [`${mutationName}`]: mutate,
    [`${mutationName}Async`]: mutateAsync,
    [`${mutationName}IsPending`]: isPending,
    [`${mutationName}IsSuccess`]: isSuccess,
    [`${mutationName}Reset`]: reset,
    [`${mutationName}IsError`]: isError,
    [`${mutationName}Error`]: error,
    [`${mutationName}Data`]: data,
    [`${mutationName}Variables`]: variables,
  } as RenameMultiple<
    UseMutationResult<TData, TError, TVariables, TContext>,
    [
      ['mutate', `${MutationName}`],
      ['mutateAsync', `${MutationName}Async`],
      ['reset', `${MutationName}Reset`],
      ['isPending', `${MutationName}IsPending`],
      ['isSuccess', `${MutationName}IsSuccess`],
      ['isError', `${MutationName}IsError`],
      ['error', `${MutationName}Error`],
      ['data', `${MutationName}Data`],
      ['variables', `${MutationName}Variables`],
    ]
  >;
}

export function formatUseQuery<TData, TError, EntityName extends string>(
  {
    data,
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    isError,
    error,
    refetch,
    ...query
  }: UseQueryResult<TData, TError>,
  entityName: EntityName,
): RenameMultiple<
  UseQueryResult<TData, TError>,
  [
    ['data', EntityName],
    ['isPending', `${EntityName}IsPending`],
    ['isLoading', `${EntityName}IsLoading`],
    ['isFetching', `${EntityName}IsFetching`],
    ['isRefetching', `${EntityName}IsRefetching`],
    ['isError', `${EntityName}IsError`],
    ['error', `${EntityName}Error`],
    ['refetch', `${EntityName}Refetch`],
  ]
> &
  RenameMultiple<QueryViewState, QueryViewStateKeyMap<EntityName>> {
  const viewState = deriveQueryViewState(data, isPending, isFetching);

  return {
    ...query,
    [`${entityName}`]: data,
    [`${entityName}IsPending`]: isPending,
    [`${entityName}IsLoading`]: isLoading,
    [`${entityName}IsFetching`]: isFetching,
    [`${entityName}IsRefetching`]: isRefetching,
    [`${entityName}IsError`]: isError,
    [`${entityName}Error`]: error,
    [`${entityName}Refetch`]: refetch,
    [`${entityName}IsInitialLoad`]: viewState.isInitialLoad,
    [`${entityName}IsBusy`]: viewState.isBusy,
  } as RenameMultiple<
    UseQueryResult<TData, TError>,
    [
      ['data', EntityName],
      ['isPending', `${EntityName}IsPending`],
      ['isLoading', `${EntityName}IsLoading`],
      ['isFetching', `${EntityName}IsFetching`],
      ['isRefetching', `${EntityName}IsRefetching`],
      ['isError', `${EntityName}IsError`],
      ['error', `${EntityName}Error`],
      ['refetch', `${EntityName}Refetch`],
    ]
  > &
    RenameMultiple<QueryViewState, QueryViewStateKeyMap<EntityName>>;
}

export type FormattedInfiniteQueryResult<TItem, TError, EntityName extends string> = {
  [K in EntityName]: TItem[];
} & {
  [K in `${EntityName}IsPending`]: boolean;
} & {
  [K in `${EntityName}IsLoading`]: boolean;
} & {
  [K in `${EntityName}IsFetching`]: boolean;
} & {
  [K in `${EntityName}IsRefetching`]: boolean;
} & {
  [K in `${EntityName}IsFetchingNextPage`]: boolean;
} & {
  [K in `${EntityName}IsError`]: boolean;
} & {
  [K in `${EntityName}Error`]: TError | null;
} & {
  [K in `${EntityName}FetchNextPage`]: () => void;
} & {
  [K in `${EntityName}HasNextPage`]: boolean;
} & {
  [K in `${EntityName}Total`]: number | undefined;
} & RenameMultiple<QueryViewState, QueryViewStateKeyMap<EntityName>>;

function readPagePaginatedTotal<TItem>(page: { items: TItem[] } | undefined): number | undefined {
  if (!page || !('meta' in page)) {
    return undefined;
  }

  const meta = (page as PagePaginatedResponse<TItem>).meta;
  return typeof meta?.total === 'number' ? meta.total : undefined;
}

export function formatUseInfiniteQuery<
  TPage extends { items: TItem[] },
  TItem,
  TError = unknown,
  EntityName extends string = string,
>(
  query: UseInfiniteQueryResult<InfiniteData<TPage>, TError>,
  entityName: EntityName,
): FormattedInfiniteQueryResult<TItem, TError, EntityName> {
  const {
    data,
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    isFetchingNextPage,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  } = query;

  const viewState = deriveQueryViewState(data, isPending, isFetching);

  return {
    [entityName]: data?.pages.flatMap((page) => page.items) ?? [],
    [`${entityName}IsPending`]: isPending,
    [`${entityName}IsLoading`]: isLoading,
    [`${entityName}IsFetching`]: isFetching,
    [`${entityName}IsRefetching`]: isRefetching && !isFetchingNextPage,
    [`${entityName}IsFetchingNextPage`]: isFetchingNextPage,
    [`${entityName}IsError`]: isError,
    [`${entityName}Error`]: error,
    [`${entityName}FetchNextPage`]: fetchNextPage,
    [`${entityName}HasNextPage`]: hasNextPage ?? false,
    [`${entityName}Total`]: readPagePaginatedTotal(data?.pages[0]),
    [`${entityName}IsInitialLoad`]: viewState.isInitialLoad,
    [`${entityName}IsBusy`]: viewState.isBusy,
  } as FormattedInfiniteQueryResult<TItem, TError, EntityName>;
}
