/**
 * Site Snapshot - orchestration service (one service per domain).
 * ===========================================================================
 * Turns a data source into a finished snapshot. It depends only on the
 * ISnapshotDataSource seam, so the exact same code runs against mock data or
 * PnPjs Graph. Pure-ish and testable: the clock (`nowMs`) is passed in, never
 * read inside.
 */

import { ISnapshotDataSource } from './dataSource';
import { computeHealthScore } from '../models/health';
import { ISiteSnapshot, IAnalyzeArgs, ISnapshotMetrics } from '../models/types';
import { formatBytes } from '../utils/formatters';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Build a full snapshot for a site. The `analyzeSite` tool calls this. */
export async function buildSnapshot(
  dataSource: ISnapshotDataSource,
  args: IAnalyzeArgs,
  nowMs: number
): Promise<ISiteSnapshot> {
  const site = await dataSource.resolveSite(args.siteUrl);
  const storage = await dataSource.getStorage(site);
  const scan = await dataSource.scanItems(site, args, nowMs);

  const daysSinceLastActivity = scan.lastActivityIso
    ? Math.floor((nowMs - Date.parse(scan.lastActivityIso)) / DAY_MS)
    : 999;

  const metrics: ISnapshotMetrics = {
    storageUsedBytes: storage.usedBytes,
    storageTotalBytes: storage.totalBytes,
    totalDocs: scan.totalScanned,
    staleDocs: scan.staleDocs.length,
    externalItemCount: scan.externalShares.filter((s) => s.kind === 'external').length,
    anyoneLinkCount: scan.externalShares.filter((s) => s.kind === 'anyone').length,
    daysSinceLastActivity,
  };

  return {
    siteName: site.siteName,
    siteUrl: args.siteUrl,
    storageUsedBytes: storage.usedBytes,
    storageTotalBytes: storage.totalBytes,
    generatedAtIso: new Date(nowMs).toISOString(),
    score: computeHealthScore(metrics),
    detail: {
      staleDocs: scan.staleDocs,
      largestFiles: scan.largestFiles,
      externalShares: scan.externalShares,
      truncated: scan.truncated,
      totalScanned: scan.totalScanned,
    },
  };
}

/** Send the snapshot as a readable HTML summary. The `emailSnapshot` tool calls this. */
export async function emailSnapshot(
  dataSource: ISnapshotDataSource,
  snapshot: ISiteSnapshot,
  recipient: string
): Promise<void> {
  const html = [
    `<h2>Site Snapshot - ${escapeHtml(snapshot.siteName)}</h2>`,
    `<p><b>Health: ${snapshot.score.score}/100</b> (${snapshot.score.verdict})</p>`,
    '<ul>',
    `<li>Storage: ${formatBytes(snapshot.storageUsedBytes)} of ${formatBytes(snapshot.storageTotalBytes)}</li>`,
    `<li>Stale documents: ${snapshot.detail.staleDocs.length}</li>`,
    `<li>External shares: ${snapshot.detail.externalShares.length}</li>`,
    `<li>Files scanned: ${snapshot.detail.totalScanned}${snapshot.detail.truncated ? ' (capped)' : ''}</li>`,
    '</ul>',
  ].join('');

  const subject = `Site Snapshot - ${snapshot.siteName} (${snapshot.score.score}/100)`;
  await dataSource.sendMail(recipient, subject, html);
}

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
