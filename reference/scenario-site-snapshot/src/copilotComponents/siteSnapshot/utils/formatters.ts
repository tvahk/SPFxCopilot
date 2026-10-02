/**
 * Site Snapshot - shared formatters.
 * ===========================================================================
 * Following the convention from your Provisioner app: format dates and numbers
 * in one place and import from here. Never redefine date formatting locally.
 */

/** Format an ISO date as a short, readable local date, e.g. "9 Mar 2026". */
export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Format a byte count as GB with two decimals, e.g. "4.20 GB". */
export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < 0) return '0 GB';
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${mb.toFixed(1)} MB`;
};

/** Format a number with thousands separators. */
export const formatNumber = (n: number): string => n.toLocaleString();

/** Format a used/total pair as a percentage integer, e.g. 42. */
export const usedPercent = (used: number, total: number): number =>
  total > 0 ? Math.round((used / total) * 100) : 0;
