/** Unwrap Hey API SDK result data. Client is configured with `throwOnError` in runtime.config. */
export async function requestData<TResult extends { data?: unknown }>(
  promise: Promise<TResult>,
): Promise<NonNullable<TResult['data']>> {
  const { data } = await promise;

  return data as NonNullable<TResult['data']>;
}
