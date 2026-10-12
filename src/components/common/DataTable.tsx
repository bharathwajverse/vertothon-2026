import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  className = '',
}: DataTableProps<T>): React.ReactElement {
  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 sm:px-6 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-slate-500"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                  <span className="text-xs font-medium">Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-slate-400 text-sm italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-4 py-3.5 sm:px-6 text-sm ${
                      col.className || ''
                    }`}
                  >
                    {col.render
                      ? col.render(row, rowIndex)
                      : String(
                          (row as Record<string, unknown>)[col.key] ?? '—'
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
