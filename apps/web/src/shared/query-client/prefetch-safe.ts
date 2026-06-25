/** Best-effort SSR prefetch — on failure, client query hooks retry and screens show error UI. */
export async function runPrefetchSafe(task: () => Promise<unknown>): Promise<void> {
  try {
    await task();
  } catch {
    // API unreachable during SSR.
  }
}
