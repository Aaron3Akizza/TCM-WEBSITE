/**
 * exportCsv — simple browser-side CSV download.
 * No external library needed — works in all modern browsers.
 *
 * @param rows     Array of plain objects. Keys become column headers.
 * @param filename Filename without extension (e.g. 'tcm-members').
 */
export function exportCsv(rows: Record<string, string | number | boolean | null | undefined>[], filename: string): void {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  const escape = (v: string | number | boolean | null | undefined): string => {
    if (v === null || v === undefined) return '';
    const str = String(v);
    // Wrap in quotes if it contains a comma, newline, or double quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
