import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { Loader2 } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  total?: number;
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyBody?: string;
  emptyCta?: React.ReactNode;
  getRowId?: (row: T) => string;
  selectedId?: string;
  className?: string;
}

export function DataTable<T>({
  columns, rows, isLoading, error, onRowClick,
  emptyTitle = "No data", emptyBody, emptyCta,
  getRowId, selectedId, className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--line)]">
              {columns.map(c => (
                <th key={c.key} className="px-3.5 py-2.5 text-left text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold bg-[#fbfaf8]">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--line)] last:border-0">
                {columns.map(c => (
                  <td key={c.key} className="px-3.5 py-2.5">
                    <div className="h-4 bg-[var(--line-2)] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[var(--line)] rounded-xl p-4">
        <div className="flex items-center gap-2 text-[var(--bad)] text-[13px]">
          <Loader2 size={14} className="text-[var(--bad)]" />
          {error}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="bg-white border border-[var(--line)] rounded-xl">
        <EmptyState title={emptyTitle} body={emptyBody} cta={emptyCta} />
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-[var(--line)] rounded-xl overflow-hidden", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--line)]">
            {columns.map(c => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}
                className="px-3.5 py-2.5 text-left text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold bg-[#fbfaf8]">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const id = getRowId ? getRowId(row) : String(i);
            const selected = selectedId === id;
            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-[var(--line)] last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-[var(--bg)]",
                  selected && "bg-[var(--accent-tint)]"
                )}
              >
                {columns.map(c => (
                  <td key={c.key} className="px-3.5 py-2.5 text-[13px] text-[var(--ink-2)] align-middle">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
