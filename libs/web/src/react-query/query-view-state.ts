export type QueryViewState = Readonly<{
  /** First fetch — no cached data yet. */
  isInitialLoad: boolean;
  /** Fetch failed before any data was available. */
  isLoadFailed: boolean;
  /** Fetch settled successfully but the entity is missing (not found / no row). */
  isEmpty: boolean;
  /** Any in-flight request (`isPending || isFetching`). */
  isBusy: boolean;
}>;

export function deriveQueryViewState<TData>(
  data: TData | undefined,
  isPending: boolean,
  isFetching: boolean,
  isError: boolean,
): QueryViewState {
  const hasData = data !== undefined && data !== null;
  const isInitialLoad = isPending && !hasData;
  const isLoadFailed = isError && !hasData;
  const isEmpty = !hasData && !isPending && !isFetching && !isError;

  return {
    isInitialLoad,
    isLoadFailed,
    isEmpty,
    isBusy: isPending || isFetching,
  };
}

export type QueryViewStateKeyMap<EntityName extends string> = [
  ['isInitialLoad', `${EntityName}IsInitialLoad`],
  ['isLoadFailed', `${EntityName}IsLoadFailed`],
  ['isEmpty', `${EntityName}IsEmpty`],
  ['isBusy', `${EntityName}IsBusy`],
];
