/**
 * Site Snapshot - the data hook.
 * ===========================================================================
 * Wraps the orchestration service in React state: loading, error, and the
 * finished snapshot. The component does not know or care which data source is
 * behind it, so the same hook works with mock or Graph data.
 *
 * All hooks are declared at the top and never inside a condition, which avoids
 * the React #300 error.
 */

import { useCallback, useEffect, useState } from 'react';
import { ISnapshotDataSource } from '../services/dataSource';
import { buildSnapshot } from '../services/siteSnapshotService';
import { ISiteSnapshot, IAnalyzeArgs } from '../models/types';
import { getFriendlyError } from '../utils/errorMessages';

export interface IUseSnapshot {
  snapshot: ISiteSnapshot | undefined;
  loading: boolean;
  error: string | undefined;
  reload: () => Promise<void>;
}

/**
 * @param dataSource which implementation to use (mock or Graph)
 * @param args       the analyse arguments (site url, stale window, top N)
 * @param nowMs      the current time, passed in so the result is deterministic
 */
export function useSnapshot(
  dataSource: ISnapshotDataSource,
  args: IAnalyzeArgs,
  nowMs: number
): IUseSnapshot {
  const [snapshot, setSnapshot] = useState<ISiteSnapshot | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await buildSnapshot(dataSource, args, nowMs);
      setSnapshot(result);
    } catch (e) {
      setError(getFriendlyError(e).message);
    } finally {
      setLoading(false);
    }
  }, [dataSource, args.siteUrl, args.staleMonths, args.topN, nowMs]);

  useEffect(() => {
    reload().catch(() => undefined);
  }, [reload]);

  return { snapshot, loading, error, reload };
}
