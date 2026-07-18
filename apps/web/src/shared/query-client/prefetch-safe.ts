/** Best-effort SSR prefetch — on failure, client query hooks retry and screens show error UI. */
export async function runPrefetchSafe<T>(task: () => Promise<T>): Promise<T | undefined> {
  try {
    return await task();
  } catch {
    return undefined;
  }
}
