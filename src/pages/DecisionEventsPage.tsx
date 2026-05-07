import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { CandidateRef } from "@/components/CandidateRef";
import { JsonViewer } from "@/components/JsonViewer";
import { AuditLog } from "@/components/AuditLog";
import { inputCls, selectCls } from "@/components/FormField";
import { DECISION_EVENTS, USE_CASES, REVIEW_TASKS } from "@/lib/mock-data";
import { formatRelativeTime, formatDateTime, truncateId } from "@/lib/utils";
import type { DecisionEvent } from "@/types/governance";

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[var(--ink-4)] text-[12px]">—</span>;
  const pct = Math.round(score * 100);
  const color =
    score >= 0.75 ? "var(--good)" : score >= 0.5 ? "var(--warn)" : "var(--bad)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-mono tabular-nums text-[var(--ink-2)] w-8">{score.toFixed(2)}</span>
      <div className="w-16 h-1.5 bg-[var(--line-2)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function RecommendationChip({ rec }: { rec: string | null }) {
  if (!rec) return <span className="text-[var(--ink-4)] text-[12px]">—</span>;
  const styles: Record<string, string> = {
    shortlist: "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
    advance: "bg-[var(--accent-tint)] border-[#dde3f4] text-[var(--accent)]",
    reject: "bg-[var(--bad-tint)] border-[#f1c9c9] text-[var(--bad)]",
    hold: "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[rec] ?? "bg-white border-[var(--line)] text-[var(--ink-2)]"}`}
    >
      {rec}
    </span>
  );
}

type DrawerTab = "overview" | "raw_event" | "ai_output" | "review" | "notice" | "audit";

const TAB_LABELS: { key: DrawerTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "raw_event", label: "Raw Event" },
  { key: "ai_output", label: "AI Output" },
  { key: "review", label: "Review" },
  { key: "notice", label: "Notice" },
  { key: "audit", label: "Audit Log" },
];

function DrawerContent({ event, tab }: { event: DecisionEvent; tab: DrawerTab }) {
  const useCase = USE_CASES.find(uc => uc.id === event.useCaseId);
  const reviewTask = REVIEW_TASKS.find(rt => rt.decisionEventId === event.id);

  const fakeRawPayload = {
    webhook_id: `wh_${event.rawEventId}`,
    timestamp: event.createdAt,
    source: event.source,
    event_type: "application.stage_changed",
    payload: {
      candidate_id: event.candidateHash,
      application_id: event.applicationId,
      job_id: event.jobId,
      job_title: event.jobTitle,
      stage_name: event.workflowStageKey,
      ai_score: event.aiScore,
      ai_recommendation: event.aiRecommendation,
    },
  };

  const fakeAiOutput = {
    model_id: "governance-rank-v2.1",
    inference_id: `inf_${event.id}_01`,
    score: event.aiScore,
    recommendation: event.aiRecommendation,
    confidence: event.aiScore !== null ? Math.round(event.aiScore * 92) / 100 : null,
    features_used: ["resume_match", "skills_overlap", "experience_years", "tenure_score"],
    explanation: "Candidate demonstrates strong alignment with role requirements. High skill overlap detected across core competencies.",
    threshold_applied: 0.65,
    above_threshold: event.aiScore !== null ? event.aiScore >= 0.65 : null,
  };

  const fakeAuditEntries = [
    {
      id: `aud_${event.id}_1`,
      at: event.createdAt,
      actor: "system",
      action: "Decision event created",
      detail: `Source: ${event.source} → ${event.workflowStageKey}`,
    },
    ...(reviewTask
      ? [
          {
            id: `aud_${event.id}_2`,
            at: reviewTask.createdAt,
            actor: "system",
            action: "Review task created",
            detail: `Review task ${reviewTask.id} assigned to ${reviewTask.assignedTo ?? "unassigned"}`,
          },
        ]
      : []),
    ...(reviewTask?.decidedAt
      ? [
          {
            id: `aud_${event.id}_3`,
            at: reviewTask.decidedAt,
            actor: reviewTask.assignedTo ?? "reviewer",
            action: `Review ${reviewTask.status}`,
            detail: reviewTask.comment ?? undefined,
          },
        ]
      : []),
  ];

  if (tab === "overview") {
    const fields = [
      { label: "Event ID", value: <span className="font-mono text-[12px]">{event.id}</span> },
      { label: "Source", value: event.source },
      { label: "Candidate Hash", value: <CandidateRef hash={event.candidateHash} /> },
      { label: "Application ID", value: <span className="font-mono text-[12px]">{event.applicationId}</span> },
      { label: "Job ID", value: <span className="font-mono text-[12px]">{event.jobId}</span> },
      { label: "Job Title", value: event.jobTitle },
      { label: "AI Use Case", value: <span className="font-mono text-[12px]">{useCase?.key ?? event.useCaseId}</span> },
      { label: "Workflow Stage", value: <span className="font-mono text-[12px]">{event.workflowStageKey}</span> },
      { label: "AI Score", value: <ScoreBar score={event.aiScore} /> },
      { label: "Recommendation", value: <RecommendationChip rec={event.aiRecommendation} /> },
      { label: "Review Required", value: event.reviewRequired ? "Yes" : "No" },
      { label: "Notice Required", value: event.noticeRequired ? "Yes" : "No" },
      { label: "Status", value: <StatusBadge status={event.status} /> },
      { label: "Created", value: formatDateTime(event.createdAt) },
    ];
    return (
      <div className="flex flex-col gap-0 divide-y divide-[var(--line)]">
        {fields.map(f => (
          <div key={f.label} className="flex items-center justify-between py-2.5 gap-4">
            <span className="text-[12px] text-[var(--ink-3)] flex-shrink-0 w-36">{f.label}</span>
            <span className="text-[13px] text-[var(--ink)] text-right">{f.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "raw_event") {
    return (
      <div>
        <p className="text-[12px] text-[var(--ink-3)] mb-3">
          Raw webhook payload received from the ATS integration.
        </p>
        <JsonViewer value={fakeRawPayload} />
      </div>
    );
  }

  if (tab === "ai_output") {
    return (
      <div>
        <p className="text-[12px] text-[var(--ink-3)] mb-3">
          Parsed AI model output extracted from the event payload.
        </p>
        <JsonViewer value={fakeAiOutput} />
      </div>
    );
  }

  if (tab === "review") {
    if (!reviewTask) {
      return (
        <div className="py-8 text-center">
          <p className="text-[13px] text-[var(--ink-3)]">No review task linked to this event.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0 divide-y divide-[var(--line)]">
          {[
            { label: "Task ID", value: <span className="font-mono text-[12px]">{reviewTask.id}</span> },
            { label: "Status", value: <StatusBadge status={reviewTask.status} /> },
            { label: "Assigned To", value: reviewTask.assignedTo ?? "Unassigned" },
            { label: "Created", value: formatDateTime(reviewTask.createdAt) },
            { label: "Decided At", value: reviewTask.decidedAt ? formatDateTime(reviewTask.decidedAt) : "—" },
            { label: "Reason Code", value: reviewTask.reasonCode ?? "—" },
            { label: "Final Decision", value: reviewTask.finalDecision ?? "—" },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-[12px] text-[var(--ink-3)] flex-shrink-0 w-28">{f.label}</span>
              <span className="text-[13px] text-[var(--ink)] text-right">{f.value}</span>
            </div>
          ))}
        </div>
        {reviewTask.comment && (
          <div className="bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)] mb-1">Reviewer Comment</p>
            <p className="text-[13px] text-[var(--ink-2)]">{reviewTask.comment}</p>
          </div>
        )}
      </div>
    );
  }

  if (tab === "notice") {
    const noticeStatus = event.noticeRequired ? "required" : "not_required";
    const fakeNotice = {
      id: `cn_${event.id}`,
      candidateHash: event.candidateHash,
      applicationId: event.applicationId,
      jobTitle: event.jobTitle,
      required: event.noticeRequired,
      status: noticeStatus,
      templateVersion: "notice-shortlist-v2",
      loggedAt: event.status === "closed" ? event.createdAt : null,
      sentAt: null,
    };
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0 divide-y divide-[var(--line)]">
          {[
            { label: "Notice ID", value: <span className="font-mono text-[12px]">{fakeNotice.id}</span> },
            { label: "Required", value: fakeNotice.required ? "Yes" : "No" },
            { label: "Status", value: <StatusBadge status={noticeStatus} /> },
            { label: "Template", value: <span className="font-mono text-[12px]">{fakeNotice.templateVersion}</span> },
            { label: "Logged At", value: fakeNotice.loggedAt ? formatDateTime(fakeNotice.loggedAt) : "—" },
            { label: "Sent At", value: "—" },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-[12px] text-[var(--ink-3)] flex-shrink-0 w-28">{f.label}</span>
              <span className="text-[13px] text-[var(--ink)] text-right">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "audit") {
    return <AuditLog entries={fakeAuditEntries} />;
  }

  return null;
}

export default function DecisionEventsPage() {
  const navigate = useNavigate();
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<DecisionEvent | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");

  const filtered = useMemo(() => {
    return DECISION_EVENTS.filter(de => {
      if (sourceFilter !== "all" && de.source !== sourceFilter) return false;
      if (statusFilter !== "all" && de.status !== statusFilter) return false;
      if (search && !de.applicationId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [sourceFilter, statusFilter, search]);

  function openDrawer(event: DecisionEvent) {
    setSelectedEvent(event);
    setDrawerTab("overview");
  }

  const columns: Column<DecisionEvent>[] = [
    {
      key: "id",
      header: "ID",
      width: "100px",
      render: row => (
        <span className="font-mono text-[12px] text-[var(--accent)] cursor-pointer hover:underline">
          {truncateId(row.id, 10)}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      width: "110px",
      render: row => (
        <span className="text-[12px] font-medium text-[var(--ink-2)]">{row.source}</span>
      ),
    },
    {
      key: "candidate",
      header: "Candidate",
      render: row => <CandidateRef hash={row.candidateHash} applicationId={row.applicationId} />,
    },
    {
      key: "applicationId",
      header: "Application ID",
      width: "110px",
      render: row => <span className="font-mono text-[12px]">{row.applicationId}</span>,
    },
    {
      key: "jobTitle",
      header: "Job Title",
      render: row => <span className="text-[13px]">{row.jobTitle}</span>,
    },
    {
      key: "useCase",
      header: "AI Use Case",
      render: row => {
        const uc = USE_CASES.find(u => u.id === row.useCaseId);
        return <span className="font-mono text-[11px] text-[var(--ink-3)]">{uc?.key ?? row.useCaseId}</span>;
      },
    },
    {
      key: "workflowStageKey",
      header: "Workflow Stage",
      render: row => <span className="font-mono text-[11px] text-[var(--ink-3)]">{row.workflowStageKey}</span>,
    },
    {
      key: "aiScore",
      header: "AI Score",
      width: "130px",
      render: row => <ScoreBar score={row.aiScore} />,
    },
    {
      key: "recommendation",
      header: "Recommendation",
      width: "120px",
      render: row => <RecommendationChip rec={row.aiRecommendation} />,
    },
    {
      key: "status",
      header: "Status",
      width: "90px",
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      width: "90px",
      render: row => (
        <span className="text-[12px] text-[var(--ink-3)]">{formatRelativeTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <Activity size={20} className="text-[var(--accent)]" />
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Decision Events</h1>
        </div>
        <p className="text-[13px] text-[var(--ink-3)]">
          All AI-assisted hiring events captured by the governance engine.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <select
          className={`${selectCls} w-[160px]`}
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
        >
          <option value="all">All sources</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="smartrecruiters">SmartRecruiters</option>
          <option value="mock_ats">Mock ATS</option>
        </select>
        <select
          className={`${selectCls} w-[140px]`}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="closed">Closed</option>
        </select>
        <input
          className={`${inputCls} w-[220px]`}
          type="text"
          placeholder="Search by application ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="text-[12px] text-[var(--ink-3)] ml-auto">
          {filtered.length} of {DECISION_EVENTS.length} events
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={row => row.id}
        selectedId={selectedEvent?.id}
        onRowClick={openDrawer}
        emptyTitle="No decision events yet"
        emptyBody="Open the Mock ATS Simulator to generate your first event"
        emptyCta={
          <button
            onClick={() => navigate("/simulator")}
            className="px-4 py-2 bg-[var(--accent)] text-white text-[13px] font-medium rounded-lg hover:bg-[#16306e] transition-colors"
          >
            Open Simulator
          </button>
        }
      />

      {/* Drawer */}
      <Drawer
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent ? `Event ${selectedEvent.id}` : ""}
        subtitle={selectedEvent ? `${selectedEvent.source} · ${selectedEvent.jobTitle}` : undefined}
        width="w-[600px]"
      >
        {selectedEvent && (
          <div>
            {/* Tabs */}
            <div className="flex gap-0 border-b border-[var(--line)] mb-5 -mx-5 px-5">
              {TAB_LABELS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setDrawerTab(t.key)}
                  className={`px-3.5 py-2 text-[12px] font-medium border-b-2 transition-colors ${
                    drawerTab === t.key
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <DrawerContent event={selectedEvent} tab={drawerTab} />
          </div>
        )}
      </Drawer>
    </div>
  );
}
