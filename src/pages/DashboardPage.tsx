import { useNavigate } from "react-router-dom";
import { MetricCard } from "@/components/MetricCard";
import { DASHBOARD_SUMMARY } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import { useSession } from "@/app/SessionContext";
import { Play, FileText, Plus } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const s = DASHBOARD_SUMMARY;
  const m = s.metrics;

  const activityKindLabel: Record<string, string> = {
    review_completed: "Review completed",
    decision_event_created: "Decision event created",
    notice_logged: "Notice logged",
    mapping_created: "Mapping created",
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Dashboard</h1>
        <p className="text-[13px] text-[var(--ink-3)] mt-1">
          Governance summary for {session?.tenantName}
        </p>
      </div>

      {/* Metrics row 1 */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <MetricCard label="AI Use Cases" value={m.useCasesTotal} delta={`${m.useCasesActive} active`}
          onClick={() => navigate("/use-cases")} />
        <MetricCard label="Active Workflows" value={m.workflowsActive}
          onClick={() => navigate("/workflows")} />
        <MetricCard label="Decision Events (30d)" value={m.decisionEvents30d} delta="+42 vs prior"
          onClick={() => navigate("/events")} />
        <MetricCard label="Pending Reviews" value={m.reviewsPending} delta={`${m.reviewsPending > 5 ? "2 overdue" : "on track"}`}
          tone={m.reviewsPending > 5 ? "warn" : "default"}
          onClick={() => navigate("/reviews?status=pending")} />
      </div>

      {/* Metrics row 2 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard label="Completed Reviews (30d)" value={m.reviewsCompleted30d}
          onClick={() => navigate("/reviews")} />
        <MetricCard label="Notices Required" value={m.noticesRequired}
          onClick={() => navigate("/notices")} />
        <MetricCard label="Notices Logged" value={m.noticesLogged}
          tone={m.noticesLogged < m.noticesRequired ? "warn" : "good"}
          onClick={() => navigate("/notices")} />
        <MetricCard label="Audit Readiness" value={`${m.auditReadinessScore}%`}
          delta="Target ≥ 90%"
          tone={m.auditReadinessScore >= 90 ? "good" : m.auditReadinessScore >= 75 ? "warn" : "bad"}
          onClick={() => navigate("/audit")} />
      </div>

      {/* Two-col: activity + charts */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-6">
        {/* Activity timeline */}
        <div className="bg-white border border-[var(--line)] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[var(--ink)] mb-3">Recent Activity</h3>
          <div className="flex flex-col gap-0">
            {s.recentActivity.map((a, i) => (
              <div key={a.id} className={`flex items-start gap-3 py-2.5 ${i < s.recentActivity.length - 1 ? "border-b border-[var(--line)]" : ""}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-[var(--ink)]">
                    {activityKindLabel[a.kind] ?? a.kind}
                  </div>
                  <div className="text-[12px] text-[var(--ink-3)] truncate">{a.summary}</div>
                </div>
                <div className="text-[11px] text-[var(--ink-4)] flex-shrink-0">{formatRelativeTime(a.at)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Review status + notice summary */}
        <div className="flex flex-col gap-3">
          <div className="bg-white border border-[var(--line)] rounded-xl p-4 flex-1">
            <h3 className="text-[13px] font-semibold text-[var(--ink)] mb-3">Review Status</h3>
            {Object.entries(s.reviewStatus).map(([key, val]) => {
              const total = Object.values(s.reviewStatus).reduce((a, b) => a + b, 0);
              const pct = Math.round((val / total) * 100);
              const colors: Record<string, string> = {
                pending: "#8a5a00", inReview: "#155c8a", accepted: "#0f6b3d", overridden: "#1f3a8a", rejected: "#9b1c1c",
              };
              return (
                <div key={key} className="flex items-center gap-2 mb-1.5">
                  <div className="text-[12px] text-[var(--ink-2)] w-20 flex-shrink-0 capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
                  <div className="flex-1 bg-[var(--line-2)] rounded-full h-1.5">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[key] }} />
                  </div>
                  <div className="text-[12px] font-mono text-[var(--ink-3)] w-6 text-right">{val}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-[var(--line)] rounded-xl p-4">
            <h3 className="text-[13px] font-semibold text-[var(--ink)] mb-2">Notice Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Required", v: s.noticeSummary.required },
                { l: "Logged", v: s.noticeSummary.logged },
                { l: "Sent", v: s.noticeSummary.sentManually },
                { l: "Acknowledged", v: s.noticeSummary.acknowledged },
              ].map(({ l, v }) => (
                <div key={l} className="text-center p-2 bg-[var(--bg)] rounded-lg">
                  <div className="text-[18px] font-semibold tabular-nums text-[var(--ink)]">{v}</div>
                  <div className="text-[10px] text-[var(--ink-3)] uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Create AI Use Case", icon: <Plus size={15} />, to: "/use-cases" },
          { label: "Add Mapping", icon: <Plus size={15} />, to: "/mappings" },
          { label: "Open Simulator", icon: <Play size={15} />, to: "/simulator" },
          { label: "Generate Audit Report", icon: <FileText size={15} />, to: "/audit" },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className="flex items-center justify-center gap-2 p-3.5 bg-[var(--ink)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--accent)] transition-colors"
          >
            {a.icon}{a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
