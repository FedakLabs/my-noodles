import type {
  InfiniteData,
  QueryClient,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

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

export function defineQueryOptions<TQueryFnData, TError = Error, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TError, TData>,
): UseQueryOptions<TQueryFnData, TError, TData> {
  return options;
}

export async function prefetchQuery<TQueryFnData, TError = Error, TData = TQueryFnData>(
  queryClient: QueryClient,
  options: UseQueryOptions<TQueryFnData, TError, TData>,
): Promise<void> {
  await queryClient.prefetchQuery(options);
}

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
    ['isError', `${EntityName}IsError`],
    ['error', `${EntityName}Error`],
    ['refetch', `${EntityName}Refetch`],
  ]
> {
  return {
    ...query,
    [`${entityName}`]: data,
    [`${entityName}IsPending`]: isPending,
    [`${entityName}IsLoading`]: isLoading,
    [`${entityName}IsFetching`]: isFetching,
    [`${entityName}IsError`]: isError,
    [`${entityName}Error`]: error,
    [`${entityName}Refetch`]: refetch,
  } as RenameMultiple<
    UseQueryResult<TData, TError>,
    [
      ['data', EntityName],
      ['isPending', `${EntityName}IsPending`],
      ['isLoading', `${EntityName}IsLoading`],
      ['isFetching', `${EntityName}IsFetching`],
      ['isError', `${EntityName}IsError`],
      ['error', `${EntityName}Error`],
      ['refetch', `${EntityName}Refetch`],
    ]
  >;
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
  [K in `${EntityName}IsError`]: boolean;
} & {
  [K in `${EntityName}Error`]: TError | null;
} & {
  [K in `${EntityName}FetchNextPage`]: () => void;
} & {
  [K in `${EntityName}HasNextPage`]: boolean;
};

export function formatUseInfiniteQuery<
  TPage extends { items: TItem[] },
  TItem,
  TError = unknown,
  EntityName extends string = string,
>(
  {
    data,
    isPending,
    isLoading,
    isFetching,
    isRefetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  }: UseInfiniteQueryResult<InfiniteData<TPage>, TError>,
  entityName: EntityName,
): FormattedInfiniteQueryResult<TItem, TError, EntityName> {
  return {
    [entityName]: data?.pages.flatMap((page) => page.items) ?? [],
    [`${entityName}IsPending`]: isPending,
    [`${entityName}IsLoading`]: isLoading,
    [`${entityName}IsFetching`]: isFetching,
    [`${entityName}IsRefetching`]: isRefetching,
    [`${entityName}IsError`]: isError,
    [`${entityName}Error`]: error,
    [`${entityName}FetchNextPage`]: fetchNextPage,
    [`${entityName}HasNextPage`]: hasNextPage ?? false,
  } as FormattedInfiniteQueryResult<TItem, TError, EntityName>;
}
