/**
 * CSV Formatting Utility complying with RFC 4180
 * Includes prevention of CSV formula injection attacks (CSV Injection / Formula Injection).
 * Cells beginning with =, +, -, @, \t, or \r are neutralized with a prepended single-quote.
 */

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // CSV Formula Injection mitigation:
  // If the string starts with =, +, -, @, \t, or \r, prepend a single quote (')
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180 escaping:
  // If value contains comma, double quote, or newline, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateCsvString(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvCell).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  // UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
