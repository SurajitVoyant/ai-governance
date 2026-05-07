import { useState } from "react";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/ConfirmModal";
import { CandidateRef } from "@/components/CandidateRef";
import { EmptyState } from "@/components/EmptyState";
import { CANDIDATE_NOTICES, USE_CASES } from "@/lib/mock-data";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import type { CandidateNotice, NoticeStatus } from "@/types/governance";
import { Bell, Check } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices] = useState([...CANDIDATE_NOTICES]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<CandidateNotice | null>(null);
  const [confirm, setConfirm] = useState<{ action: string; notice: CandidateNotice } | null>(null);

  const useCaseMap = Object.fromEntries(USE_CASES.map(u => [u.id, u.key]));

  const filtered = notices.filter(n =>
    !statusFilter || n.status === statusFilter
  );

  function transition(notice: CandidateNotice, toStatus: NoticeStatus) {
    const updated = notices.map(n =>
      n.id === notice.id
        ? {
            ...n,
            status: toStatus,
            loggedAt: toStatus === "logged" && !n.loggedAt ? new Date().toISOString() : n.loggedAt,
            sentAt: toStatus === "sent_manually" ? new Date().toISOString() : n.sentAt,
          }
        : n
    );
    setNotices(updated);
    if (selected?.id === notice.id) {
      setSelected(updated.find(x => x.id === notice.id) ?? null);
    }
  }

  const columns: Column<CandidateNotice>[] = [
    { key: "id", header: "Notice ID", render: n => <span className="font-mono text-[12px] text-[var(--ink-3)]">{n.id}</span> },
    { key: "candidate", header: "Candidate", render: n => <CandidateRef hash={n.candidateHash} /> },
    { key: "app", header: "Application", render: n => <span className="font-mono text-[12px]">{n.applicationId}</span> },
    { key: "job", header: "Job Title", render: n => <span className="text-[var(--ink)]">{n.jobTitle}</span> },
    { key: "useCase", header: "AI Use Case", render: n => <span className="font-mono text-[12px] text-[var(--ink-2)]">{useCaseMap[n.useCaseId] ?? n.useCaseId}</span> },
    { key: "required", header: "Required", render: n => n.required ? <Check size={14} className="text-[var(--good)]" /> : <span className="text-[var(--ink-4)]">—</span> },
    { key: "status", header: "Status", render: n => <StatusBadge status={n.status} /> },
    { key: "template", header: "Template", render: n => <span className="font-mono text-[11px] text-[var(--ink-3)]">{n.templateVersion}</span> },
    { key: "logged", header: "Logged", render: n => n.loggedAt ? <span className="text-[11px] text-[var(--ink-3)]">{formatRelativeTime(n.loggedAt)}</span> : <span className="text-[var(--ink-4)]">—</span> },
    { key: "sent", header: "Sent", render: n => n.sentAt ? <span className="text-[11px] text-[var(--ink-3)]">{formatRelativeTime(n.sentAt)}</span> : <span className="text-[var(--ink-4)]">—</span> },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Candidate Notices</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-0.5">Track notice obligations for AI-assisted decisions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <select
          className="px-3 py-1.5 text-[12px] border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] focus:outline-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="required">Required</option>
          <option value="logged">Logged</option>
          <option value="sent_manually">Sent Manually</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="not_required">Not Required</option>
        </select>
        <span className="text-[12px] text-[var(--ink-3)]">{filtered.length} notice{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No notices found"
          body="Candidate notices are auto-created when decision events arrive at notice-required stages."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={n => n.id}
          selectedId={selected?.id}
          onRowClick={setSelected}
        />
      )}

      {/* Detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Notice: ${selected?.id ?? ""}`}
        subtitle={selected?.status}
        footer={
          selected && (
            <div className="flex gap-2 flex-wrap">
              {selected.status === "required" && (
                <button
                  className="px-3 py-1.5 rounded-lg bg-[var(--info-tint)] text-[var(--info)] border border-[#c9dff0] text-[12px] font-medium hover:bg-[#d5e9f5] transition-colors"
                  onClick={() => setConfirm({ action: "log", notice: selected })}
                >
                  Mark as Logged
                </button>
              )}
              {selected.status === "logged" && (
                <button
                  className="px-3 py-1.5 rounded-lg bg-[var(--good-tint)] text-[var(--good)] border border-[#cfe2d4] text-[12px] font-medium hover:bg-[#daeee1] transition-colors"
                  onClick={() => setConfirm({ action: "send", notice: selected })}
                >
                  Mark as Sent Manually
                </button>
              )}
              {selected.status === "sent_manually" && (
                <button
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent-tint)] text-[var(--accent)] border border-[#dde3f4] text-[12px] font-medium hover:bg-[#dde5f8] transition-colors"
                  onClick={() => { transition(selected, "acknowledged"); setSelected(null); }}
                >
                  Mark as Acknowledged
                </button>
              )}
            </div>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold mb-2">Subject</h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  ["Candidate", <CandidateRef hash={selected.candidateHash} />],
                  ["Application", <span className="font-mono text-[12px]">{selected.applicationId}</span>],
                  ["Job Title", selected.jobTitle],
                  ["Use Case", <span className="font-mono text-[12px]">{useCaseMap[selected.useCaseId]}</span>],
                  ["Required", selected.required ? "Yes" : "No"],
                  ["Status", <StatusBadge status={selected.status} />],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <dt className="text-[11px] text-[var(--ink-4)]">{k}</dt>
                    <dd className="text-[13px] text-[var(--ink-2)] mt-0.5">{v as React.ReactNode}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold mb-2">Template</h4>
              <div className="font-mono text-[12px] text-[var(--ink)] bg-[var(--bg)] rounded-lg px-3 py-2 border border-[var(--line)]">
                {selected.templateVersion}
              </div>
              <div className="mt-2 p-3 bg-[var(--bg)] rounded-lg border border-[var(--line)] text-[12px] text-[var(--ink-2)] leading-relaxed">
                <p>Dear Candidate,</p>
                <p className="mt-2">We want to inform you that artificial intelligence technology was used to assist in evaluating applications for this position. As part of our commitment to transparency, we are notifying you of this use of automated decision-making tools.</p>
                <p className="mt-2">You have the right to request human review of any AI-assisted decision. Please contact our recruitment team for more information.</p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold mb-2">Timeline</h4>
              <div className="flex flex-col gap-2">
                {[
                  ["Required", selected.loggedAt ?? "Pending"],
                  ["Logged at", selected.loggedAt ? formatDateTime(selected.loggedAt) : "—"],
                  ["Sent manually at", selected.sentAt ? formatDateTime(selected.sentAt) : "—"],
                  ["Acknowledged at", "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--line)] last:border-0">
                    <span className="text-[12px] text-[var(--ink-3)]">{label}</span>
                    <span className="text-[12px] text-[var(--ink)]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.action === "log" ? "Mark notice as Logged?" : "Mark notice as Sent Manually?"}
        body={`This will update the notice status for application ${confirm?.notice.applicationId}. This action is logged.`}
        confirmLabel={confirm?.action === "log" ? "Mark as Logged" : "Mark as Sent"}
        onConfirm={() => {
          if (!confirm) return;
          transition(confirm.notice, confirm.action === "log" ? "logged" : "sent_manually");
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
