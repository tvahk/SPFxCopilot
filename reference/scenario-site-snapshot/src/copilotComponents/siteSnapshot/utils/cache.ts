/**
 * Site Snapshot - tiny TTL cache for expensive reads.
 * ===========================================================================
 * Graph reads are slow and throttled, so cache them for a few minutes. Following
 * your Provisioner convention: cache reads, and invalidate by prefix after any
 * write so stale data does not linger.
 */

interface ICacheEntry<T> {
  value: T;
  ts: number;
}

const store = new Map<string, ICacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Return the cached value for `key`, or run `fetcher`, cache it, and return it.
 * Deterministic-clock friendly: pass `nowMs` so tests do not read the clock.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  nowMs: number,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const hit = store.get(key) as ICacheEntry<T> | undefined;
  if (hit && nowMs - hit.ts < ttlMs) return hit.value;

  const value = await fetcher();
  store.set(key, { value, ts: nowMs });
  return value;
}

/** Drop every cache entry whose key starts with `prefix`. Call after writes. */
export function invalidate(prefix: string): void {
  for (const key of Array.from(store.keys())) {
    if (key.indexOf(prefix) === 0) store.delete(key);
  }
}
