/**
 * Site Snapshot - domain types (the single source of truth).
 * ===========================================================================
 * SPFx 1.24 preview study material. These interfaces are pure TypeScript and
 * safe to use as-is. Everything else (health scoring, services, hooks, UI)
 * imports its shapes from here, so there is one place to change a field.
 */

/** The raw numbers the health score is computed from. */
export interface ISnapshotMetrics {
  storageUsedBytes: number;
  storageTotalBytes: number;
  totalDocs: number;
  staleDocs: number; // documents not modified within the stale window
  externalItemCount: number; // items shared with external users (not "Anyone")
  anyoneLinkCount: number; // items shared via an "Anyone" link
  daysSinceLastActivity: number; // across the analysed scope
}

/** The computed score, with everything needed to explain it in the UI. */
export interface ISnapshotScore {
  score: number; // 0 to 100
  verdict: 'Healthy' | 'Watch' | 'At risk';
  subScores: {
    // points retained out of each weight; higher is better
    storage: number;
    stale: number;
    exposure: number;
    frecency: number;
  };
  penalties: {
    // points lost, used for the "why" explanation
    storage: number;
    stale: number;
    exposure: number;
    frecency: number;
  };
}

/** A single stale document row. */
export interface IStaleDoc {
  name: string;
  webUrl: string;
  modifiedIso: string;
}

/** A single largest-file row. */
export interface ILargeFile {
  name: string;
  webUrl: string;
  sizeBytes: number;
}

/** A single external-sharing row. */
export interface IExternalShare {
  name: string;
  webUrl: string;
  kind: 'anyone' | 'external';
  sharedWith: string;
}

/** The detail lists that back the three dashboard panels. */
export interface ISnapshotDetail {
  staleDocs: IStaleDoc[];
  largestFiles: ILargeFile[];
  externalShares: IExternalShare[];
  truncated: boolean; // true when the item scan hit its cap
  totalScanned: number;
}

/** The full result of analysing a site. */
export interface ISiteSnapshot {
  siteName: string;
  siteUrl: string;
  storageUsedBytes: number;
  storageTotalBytes: number;
  generatedAtIso: string; // stamped by the caller, never inside pure code
  score: ISnapshotScore;
  detail: ISnapshotDetail;
}

/** Arguments for a site analysis (defaults applied by the Zod schema). */
export interface IAnalyzeArgs {
  siteUrl: string;
  staleMonths: number;
  topN: number;
}
