/**
 * Site Snapshot - CSV export.
 * ===========================================================================
 * Shared client-side CSV download, following your Provisioner convention of a
 * single csvExport utility. Escapes values safely and triggers a browser
 * download with no external dependency.
 */

/** Quote a CSV cell if it contains a comma, quote, or newline. */
const escapeCell = (value: unknown): string => {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

/**
 * Build a CSV string and download it as `filename`. `headers` label the columns;
 * each row is an array of cells in the same order.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: unknown[][]
): void {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','));
  const csv = lines.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
