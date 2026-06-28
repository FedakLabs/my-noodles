export type QueryViewState = Readonly<{
  /** First fetch — no cached data yet. */
  isInitialLoad: boolean;
  /** Any in-flight request (`isPending || isFetching`). */
  isBusy: boolean;
}>;

export function deriveQueryViewState<TData>(
  data: TData | undefined,
  isPending: boolean,
  isFetching: boolean,
): QueryViewState {
  const hasData = data !== undefined && data !== null;
  const isInitialLoad = isPending && !hasData;

  return {
    isInitialLoad,
    isBusy: isPending || isFetching,
  };
}

export type QueryViewStateKeyMap<EntityName extends string> = [
  ['isInitialLoad', `${EntityName}IsInitialLoad`],
  ['isBusy', `${EntityName}IsBusy`],
];
