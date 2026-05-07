import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { StatusBadge } from "@/components/Badge";
import { CandidateRef } from "@/components/CandidateRef";
import { AuditLog } from "@/components/AuditLog";
import { FormField, inputCls, selectCls } from "@/components/FormField";
import { REVIEW_TASKS, USE_CASES } from "@/lib/mock-data";
import { formatRelativeTime, formatDateTime, truncateId, cn } from "@/lib/utils";
import type { ReviewTask, ReasonCode } from "@/types/governance";

type TabFilter = "all" | "pending" | "in_review" | "completed";

const TAB_FILTERS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_review", label: "In Review" },
  { key: "completed", label: "Completed" },
];

const COMPLETED_STATUSES = new Set(["accepted", "overridden", "rejected", "more_info"]);

function ScoreDisplay({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[var(--ink-4)]">—</span>;
  const color =
    score >= 0.75 ? "var(--good)" : score >= 0.5 ? "var(--warn)" : "var(--bad)";
  return (
    <span
      className="text-[13px] font-semibold tabular-nums font-mono"
      style={{ color }}
    >
      {score.toFixed(2)}
    </span>
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border ${
        styles[rec] ?? "bg-white border-[var(--line)] text-[var(--ink-2)]"
      }`}
    >
      {rec}
    </span>
  );
}

type ReviewAction = "accept" | "override" | "reject" | "more_info";

interface ReviewFormState {
  action: ReviewAction;
  reasonCode: ReasonCode | "";
  comment: string;
  finalDecision: string;
}

const DEFAULT_FORM: ReviewFormState = {
  action: "accept",
  reasonCode: "",
  comment: "",
  finalDecision: "shortlist",
};

function TaskDetail({
  task,
  onUpdate,
}: {
  task: ReviewTask;
  onUpdate: (id: string, patch: Partial<ReviewTask>) => void;
}) {
  const [form, setForm] = useState<ReviewFormState>(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);

  // Reset form whenever a different task is opened
  useEffect(() => {
    setForm(DEFAULT_FORM);
    setSubmitted(false);
  }, [task.id]);

  const useCase = USE_CASES.find(uc => uc.id === task.useCaseId);
  const isCompleted = COMPLETED_STATUSES.has(task.status);
  const needsExtra = form.action === "override" || form.action === "reject";

  const fakeEvidence =
    task.aiScore !== null && task.aiScore >= 0.75
      ? "Strong resume match detected. Candidate scores in top quartile across required skills. Experience aligns closely with role requirements."
      : task.aiScore !== null && task.aiScore >= 0.5
      ? "Moderate resume match. Candidate meets baseline requirements but has limited experience in two key areas. Manual review recommended."
      : "Weak match detected. Candidate does not meet minimum threshold for multiple required skills. AI recommends rejection.";

  const auditEntries = [
    {
      id: `aud_${task.id}_1`,
      at: task.createdAt,
      actor: "system",
      action: "Review task created",
      detail: `Decision event ${task.decisionEventId}`,
    },
    ...(task.assignedTo
      ? [
          {
            id: `aud_${task.id}_2`,
            at: task.createdAt,
            actor: "system",
            action: "Task assigned",
            detail: `Assigned to ${task.assignedTo}`,
          },
        ]
      : []),
    ...(task.decidedAt
      ? [
          {
            id: `aud_${task.id}_3`,
            at: task.decidedAt,
            actor: task.assignedTo ?? "reviewer",
            action: `Decision: ${task.status}`,
            detail: task.comment ?? undefined,
          },
        ]
      : []),
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();

    const statusMap: Record<ReviewAction, ReviewTask["status"]> = {
      accept: "accepted",
      override: "overridden",
      reject: "rejected",
      more_info: "more_info",
    };

    const patch: Partial<ReviewTask> = {
      status: statusMap[form.action],
      decidedAt: now,
      reasonCode: needsExtra && form.reasonCode ? (form.reasonCode as ReasonCode) : null,
      comment: needsExtra && form.comment ? form.comment : null,
      finalDecision:
        form.action === "override"
          ? form.finalDecision
          : form.action === "accept"
          ? task.aiRecommendation
          : form.action === "reject"
          ? "reject"
          : null,
    };

    onUpdate(task.id, patch);
    setSubmitted(true);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--line)] flex-shrink-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">{task.id}</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="text-[13px] text-[var(--ink-3)]">{task.jobTitle}</div>
          </div>
          <CandidateRef hash={task.candidateHash} />
        </div>
        <div className="flex items-center gap-4 text-[12px] text-[var(--ink-3)]">
          <span>
            Use case:{" "}
            <span className="font-mono text-[var(--ink-2)]">{useCase?.key ?? task.useCaseId}</span>
          </span>
          <span>·</span>
          <span>
            Stage:{" "}
            <span className="font-mono text-[var(--ink-2)]">{task.workflowStageKey}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 px-6 py-5">
        {/* Two-col: AI recommendation + review action */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* AI Recommendation panel */}
          <div className="bg-[var(--bg)] border border-[var(--line)] rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">
              AI Recommendation
            </h3>

            {/* Large score */}
            <div className="text-center py-3">
              {task.aiScore !== null ? (
                <>
                  <div
                    className="text-[40px] font-bold tabular-nums leading-none"
                    style={{
                      color:
                        task.aiScore >= 0.75
                          ? "var(--good)"
                          : task.aiScore >= 0.5
                          ? "var(--warn)"
                          : "var(--bad)",
                    }}
                  >
                    {task.aiScore.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[var(--ink-3)] mt-1 uppercase tracking-wider">AI Score</div>
                </>
              ) : (
                <span className="text-[var(--ink-4)] text-[20px]">—</span>
              )}
            </div>

            <div className="flex justify-center">
              <RecommendationChip rec={task.aiRecommendation} />
            </div>

            <div className="border-t border-[var(--line)] pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)] mb-1.5">
                Evidence Summary
              </p>
              <p className="text-[12px] text-[var(--ink-2)] leading-relaxed">{fakeEvidence}</p>
            </div>

            <div className="border-t border-[var(--line)] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--ink-3)]">Workflow Stage</span>
                <span className="font-mono text-[11px] text-[var(--ink-2)]">{task.workflowStageKey}</span>
              </div>
            </div>
          </div>

          {/* Review Action form */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)] mb-4">
              Review Action
            </h3>

            {isCompleted && !submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <CheckCircle2 size={24} className="text-[var(--good)]" />
                <p className="text-[13px] font-medium text-[var(--ink)]">Decision recorded</p>
                <StatusBadge status={task.status} />
                {task.decidedAt && (
                  <p className="text-[12px] text-[var(--ink-3)]">{formatDateTime(task.decidedAt)}</p>
                )}
              </div>
            ) : submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <CheckCircle2 size={24} className="text-[var(--good)]" />
                <p className="text-[13px] font-semibold text-[var(--good)]">Decision submitted</p>
                <p className="text-[12px] text-[var(--ink-3)]">Task updated successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Action radio */}
                <FormField label="Action">
                  <div className="flex flex-col gap-1.5">
                    {(
                      [
                        { value: "accept", label: "Accept" },
                        { value: "override", label: "Override" },
                        { value: "reject", label: "Reject" },
                        { value: "more_info", label: "Request More Info" },
                      ] as { value: ReviewAction; label: string }[]
                    ).map(opt => (
                      <label
                        key={opt.value}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-[13px]",
                          form.action === opt.value
                            ? "border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]"
                            : "border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--bg)]"
                        )}
                      >
                        <input
                          type="radio"
                          name="action"
                          value={opt.value}
                          checked={form.action === opt.value}
                          onChange={() => setForm(f => ({ ...f, action: opt.value }))}
                          className="accent-[var(--accent)]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </FormField>

                {needsExtra && (
                  <>
                    <FormField label="Reason Code" required>
                      <select
                        className={selectCls}
                        value={form.reasonCode}
                        onChange={e => setForm(f => ({ ...f, reasonCode: e.target.value as ReasonCode | "" }))}
                        required
                      >
                        <option value="">Select reason…</option>
                        <option value="data_incomplete">Data Incomplete</option>
                        <option value="model_unreliable">Model Unreliable</option>
                        <option value="bias_concern">Bias Concern</option>
                        <option value="business_judgment">Business Judgment</option>
                        <option value="policy_override">Policy Override</option>
                        <option value="other">Other</option>
                      </select>
                    </FormField>

                    <FormField label="Comment">
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={3}
                        maxLength={1000}
                        placeholder="Add a comment explaining your decision…"
                        value={form.comment}
                        onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      />
                      <span className="text-[11px] text-[var(--ink-4)] self-end">
                        {form.comment.length}/1000
                      </span>
                    </FormField>

                    {form.action === "override" && (
                      <FormField label="Final Decision" required>
                        <select
                          className={selectCls}
                          value={form.finalDecision}
                          onChange={e => setForm(f => ({ ...f, finalDecision: e.target.value }))}
                        >
                          <option value="shortlist">shortlist</option>
                          <option value="advance">advance</option>
                          <option value="reject">reject</option>
                          <option value="hold">hold</option>
                        </select>
                      </FormField>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className="w-full mt-1 py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-lg hover:bg-[#16306e] transition-colors"
                >
                  Submit Decision
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Audit log */}
        <div className="border-t border-[var(--line)] pt-5">
          <h3 className="text-[13px] font-semibold text-[var(--ink)] mb-4">Audit Log</h3>
          <AuditLog entries={auditEntries} />
        </div>
      </div>
    </div>
  );
}

export default function ReviewQueuePage() {
  const [tasks, setTasks] = useState<ReviewTask[]>([...REVIEW_TASKS]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>("all");

  const selectedTask = tasks.find(t => t.id === selectedId) ?? null;

  const filtered = tasks.filter(t => {
    if (tab === "all") return true;
    if (tab === "pending") return t.status === "pending";
    if (tab === "in_review") return t.status === "in_review";
    if (tab === "completed") return COMPLETED_STATUSES.has(t.status);
    return true;
  });

  function updateTask(id: string, patch: Partial<ReviewTask>) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedTask) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      // shortcuts only for active (non-completed) tasks
      if (COMPLETED_STATUSES.has(selectedTask.status)) return;
      const now = new Date().toISOString();
      if (e.key === "a" || e.key === "A") {
        updateTask(selectedTask.id, {
          status: "accepted",
          decidedAt: now,
          finalDecision: selectedTask.aiRecommendation,
        });
      } else if (e.key === "o" || e.key === "O") {
        updateTask(selectedTask.id, { status: "overridden", decidedAt: now });
      } else if (e.key === "r" || e.key === "R") {
        updateTask(selectedTask.id, { status: "rejected", decidedAt: now, finalDecision: "reject" });
      }
    },
    [selectedTask]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const inReviewCount = tasks.filter(t => t.status === "in_review").length;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-[var(--line)] bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardList size={20} className="text-[var(--accent)]" />
            <h1 className="text-[20px] font-bold text-[var(--ink)] tracking-tight">Review Queue</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--warn-tint)] border border-[#f0dfb4] text-[var(--warn)]">
                {pendingCount} pending
              </span>
            )}
          </div>
          {/* Keyboard shortcut hint */}
          <div className="flex items-center gap-3 text-[11px] text-[var(--ink-4)]">
            <span>Shortcuts:</span>
            {[
              { key: "A", label: "accept" },
              { key: "O", label: "override" },
              { key: "R", label: "reject" },
            ].map(s => (
              <span key={s.key} className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--line-2)] border border-[var(--line)] rounded text-[10px] font-mono font-semibold">
                  {s.key}
                </kbd>
                <span>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Task list (40%) */}
        <div className="w-[40%] border-r border-[var(--line)] flex flex-col bg-[var(--bg)]">
          {/* Tabs */}
          <div className="flex border-b border-[var(--line)] bg-white flex-shrink-0">
            {TAB_FILTERS.map(t => {
              const count =
                t.key === "all"
                  ? tasks.length
                  : t.key === "pending"
                  ? pendingCount
                  : t.key === "in_review"
                  ? inReviewCount
                  : tasks.filter(tk => COMPLETED_STATUSES.has(tk.status)).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors",
                    tab === t.key
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]"
                  )}
                >
                  {t.label}
                  <span className="text-[10px] bg-[var(--line-2)] px-1.5 py-0.5 rounded-full tabular-nums">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Task list items */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <ClipboardList size={24} className="text-[var(--ink-4)] mb-2" />
                <p className="text-[13px] text-[var(--ink-3)]">No tasks in this view.</p>
              </div>
            ) : (
              filtered.map(task => {
                const isSelected = selectedId === task.id;
                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedId(task.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-[var(--line)] transition-colors",
                      isSelected
                        ? "bg-[var(--accent-tint)] border-l-2 border-l-[var(--accent)]"
                        : "bg-white hover:bg-[var(--bg)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[11px] text-[var(--ink-3)]">
                        {truncateId(task.id, 10)}
                      </span>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <CandidateRef hash={task.candidateHash} />
                    </div>
                    <div className="text-[12px] text-[var(--ink)] font-medium truncate mb-1">
                      {task.jobTitle}
                    </div>
                    <div className="flex items-center justify-between">
                      <ScoreDisplay score={task.aiScore} />
                      <span className="text-[11px] text-[var(--ink-4)]">
                        {formatRelativeTime(task.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Task detail (60%) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
          {selectedTask ? (
            <TaskDetail
              key={selectedTask.id}
              task={selectedTask}
              onUpdate={updateTask}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <ClipboardList size={32} className="text-[var(--ink-4)] mb-3" />
              <h3 className="text-[15px] font-semibold text-[var(--ink)] mb-1">
                Select a task from the left panel
              </h3>
              <p className="text-[13px] text-[var(--ink-3)] max-w-[36ch]">
                Click any review task to see its details, AI recommendation, and submit a decision.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
