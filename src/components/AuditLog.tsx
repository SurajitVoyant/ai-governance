import { formatDateTime } from "@/lib/utils";

interface AuditEntry {
  id: string;
  at: string;
  actor?: string;
  action: string;
  detail?: string;
}

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return <p className="text-[13px] text-[var(--ink-3)]">No audit entries.</p>;
  }
  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--line)]" />
      <div className="flex flex-col gap-4">
        {entries.map((e) => (
          <div key={e.id} className="flex gap-3 relative pl-8">
            <div className="absolute left-0 w-6 h-6 rounded-full bg-white border-2 border-[var(--line)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-[var(--ink-3)] font-mono">{formatDateTime(e.at)}</div>
              <div className="text-[13px] font-medium text-[var(--ink)] mt-0.5">{e.action}</div>
              {e.actor && <div className="text-[12px] text-[var(--ink-3)]">{e.actor}</div>}
              {e.detail && <div className="text-[12px] text-[var(--ink-2)] mt-0.5">{e.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
