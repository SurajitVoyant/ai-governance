import { useState } from "react";
import { cn } from "@/lib/utils";
import { DASHBOARD_SUMMARY } from "@/lib/mock-data";
import { Check, X, Download, FileText } from "lucide-react";

interface ReportData {
  id: string;
  scope: { from: string; to: string; sources: string[] };
  score: { overall: number; sub: { oversight: number; notices: number; mappings: number; data: number } };
  summary: {
    useCases: Array<{ key: string; events: number; overrideRate: number; noticeRate: number }>;
    reviews: { total: number; accepted: number; overridden: number; rejected: number; medianMinutesToDecide: number };
    notices: { required: number; logged: number; sent: number; acknowledged: number };
  };
  missing: Array<{ kind: string; count: number }>;
  checklist: Array<{ key: string; pass: boolean }>;
  generatedAt: string;
}

const CHECKLIST_LABELS: Record<string, string> = {
  all_high_risk_use_cases_have_review: "All high-risk use cases have human review enabled",
  all_required_notices_logged: "All required candidate notices logged",
  no_stale_mappings: "No stale integration mappings (active in last 30d)",
  review_sla_met: "All reviews decided within 72-hour SLA",
  audit_trail_complete: "Complete audit trail for all decision events",
  no_open_high_risk_events: "No open high-risk decision events >7 days",
  workflow_coverage_100: "100% of ATS stages have governance mapping",
  override_rate_documented: "All overrides have documented reason codes",
  notice_sent_rate_90: "≥90% of required notices marked sent",
  data_retention_compliant: "Data retention policy active and documented",
};

export default function AuditReportPage() {
  const [dateFrom, setDateFrom] = useState("2026-04-07");
  const [dateTo, setDateTo] = useState("2026-05-07");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  async function generate() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const m = DASHBOARD_SUMMARY.metrics;
    setReport({
      id: "rep_01",
      scope: { from: dateFrom, to: dateTo, sources: source ? [source] : [] },
      score: {
        overall: m.auditReadinessScore,
        sub: { oversight: 92, notices: 81, mappings: 88, data: 79 },
      },
      summary: {
        useCases: [
          { key: "candidate-shortlisting-v1", events: 142, overrideRate: 0.18, noticeRate: 0.93 },
          { key: "resume-screening-v1", events: 58, overrideRate: 0.07, noticeRate: 0.40 },
          { key: "interview-ranking-v1", events: 18, overrideRate: 0.22, noticeRate: 1.0 },
        ],
        reviews: { total: 189, accepted: 142, overridden: 31, rejected: 16, medianMinutesToDecide: 38 },
        notices: { required: m.noticesRequired, logged: m.noticesLogged, sent: 22, acknowledged: 11 },
      },
      missing: [
        { kind: "review_missing", count: 3 },
        { kind: "notice_unlogged", count: 4 },
      ],
      checklist: [
        { key: "all_high_risk_use_cases_have_review", pass: true },
        { key: "all_required_notices_logged", pass: false },
        { key: "no_stale_mappings", pass: true },
        { key: "review_sla_met", pass: true },
        { key: "audit_trail_complete", pass: true },
        { key: "no_open_high_risk_events", pass: false },
        { key: "workflow_coverage_100", pass: true },
        { key: "override_rate_documented", pass: true },
        { key: "notice_sent_rate_90", pass: false },
        { key: "data_retention_compliant", pass: true },
      ],
      generatedAt: new Date().toISOString(),
    });
    setLoading(false);
  }

  function ScoreGauge({ label, score }: { label: string; score: number }) {
    const color = score >= 90 ? "var(--good)" : score >= 75 ? "var(--warn)" : "var(--bad)";
    return (
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-1">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
              strokeDasharray={`${(score / 100) * 87.96} 87.96`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[12px] font-bold" style={{ color }}>{score}</span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--ink-3)] uppercase tracking-wider">{label}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Audit Report</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-0.5">Generate an audit-readiness summary for a date range</p>
        </div>
        {report && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ink)] text-white text-[12px] font-medium hover:bg-[var(--accent)] transition-colors">
            <Download size={13} /> Export ▾
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[var(--line)] rounded-xl p-4 mb-5">
        <div className="grid grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-[var(--ink-4)] mb-1 font-semibold uppercase tracking-wider">From</label>
            <input type="date" className="w-full px-3 py-2 text-[13px] border border-[var(--line)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--ink-4)] mb-1 font-semibold uppercase tracking-wider">To</label>
            <input type="date" className="w-full px-3 py-2 text-[13px] border border-[var(--line)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--ink-4)] mb-1 font-semibold uppercase tracking-wider">ATS Source</label>
            <select className="w-full px-3 py-2 text-[13px] border border-[var(--line)] rounded-lg bg-white focus:outline-none"
              value={source} onChange={e => setSource(e.target.value)}>
              <option value="">All sources</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
              <option value="smartrecruiters">SmartRecruiters</option>
              <option value="mock_ats">Mock ATS</option>
            </select>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--ink)] text-white text-[13px] font-semibold hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
            ) : (
              <><FileText size={14} />Generate Report</>
            )}
          </button>
        </div>
      </div>

      {!report && !loading && (
        <div className="bg-white border border-[var(--line)] rounded-xl py-16 flex flex-col items-center gap-2 text-center">
          <FileText size={28} className="text-[var(--ink-4)]" />
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">No report yet</h3>
          <p className="text-[13px] text-[var(--ink-3)]">Set filters and click Generate Report</p>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-[var(--line)] rounded-xl py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--line)] border-t-[var(--accent)] rounded-full animate-spin" />
          <p className="text-[13px] text-[var(--ink-3)]">Generating report…</p>
        </div>
      )}

      {report && !loading && (
        <div className="flex flex-col gap-5">
          {/* Score card */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--ink)]">Audit Readiness Score</h3>
                <p className="text-[12px] text-[var(--ink-3)]">Generated {new Date(report.generatedAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-[40px] font-bold tabular-nums",
                  report.score.overall >= 90 ? "text-[var(--good)]" :
                  report.score.overall >= 75 ? "text-[var(--warn)]" : "text-[var(--bad)]"
                )}>
                  {report.score.overall}%
                </div>
                <div className="text-[11px] text-[var(--ink-3)]">Target ≥ 90%</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <ScoreGauge label="Oversight" score={report.score.sub.oversight} />
              <ScoreGauge label="Notices" score={report.score.sub.notices} />
              <ScoreGauge label="Mappings" score={report.score.sub.mappings} />
              <ScoreGauge label="Data" score={report.score.sub.data} />
            </div>
          </div>

          {/* Use Case Summary */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-3">AI Use Case Summary</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  {["Use Case", "Events", "Override Rate", "Notice Rate"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--ink-4)] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.summary.useCases.map(uc => (
                  <tr key={uc.key} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--ink)]">{uc.key}</td>
                    <td className="px-3 py-2.5 text-[13px] font-semibold tabular-nums">{uc.events}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-[12px] font-semibold", uc.overrideRate > 0.2 ? "text-[var(--warn)]" : "text-[var(--ink-2)]")}>
                        {(uc.overrideRate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-[12px] font-semibold", uc.noticeRate < 0.9 ? "text-[var(--warn)]" : "text-[var(--good)]")}>
                        {(uc.noticeRate * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Human Oversight */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white border border-[var(--line)] rounded-xl p-5">
              <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-3">Human Oversight</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Total Reviews", v: report.summary.reviews.total },
                  { l: "Accepted", v: report.summary.reviews.accepted },
                  { l: "Overridden", v: report.summary.reviews.overridden },
                  { l: "Rejected", v: report.summary.reviews.rejected },
                  { l: "Median Time", v: `${report.summary.reviews.medianMinutesToDecide}min` },
                ].map(({ l, v }) => (
                  <div key={l} className="p-2.5 bg-[var(--bg)] rounded-lg">
                    <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-wider">{l}</div>
                    <div className="text-[18px] font-semibold text-[var(--ink)] tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[var(--line)] rounded-xl p-5">
              <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-3">Candidate Notices</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Required", v: report.summary.notices.required },
                  { l: "Logged", v: report.summary.notices.logged },
                  { l: "Sent", v: report.summary.notices.sent },
                  { l: "Acknowledged", v: report.summary.notices.acknowledged },
                ].map(({ l, v }) => (
                  <div key={l} className="p-2.5 bg-[var(--bg)] rounded-lg">
                    <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-wider">{l}</div>
                    <div className="text-[18px] font-semibold text-[var(--ink)] tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing evidence */}
          {report.missing.length > 0 && (
            <div className="bg-[var(--warn-tint)] border border-[#f0dfb4] rounded-xl p-4">
              <h3 className="text-[13px] font-semibold text-[var(--warn)] mb-2">Missing Evidence</h3>
              <ul className="flex flex-col gap-1.5">
                {report.missing.map(m => (
                  <li key={m.kind} className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--ink-2)]">{m.kind.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-[var(--warn)]">{m.count} item{m.count !== 1 ? "s" : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-3">
              Audit Readiness Checklist
              <span className="ml-2 text-[12px] font-normal text-[var(--ink-3)]">
                {report.checklist.filter(c => c.pass).length}/{report.checklist.length} passed
              </span>
            </h3>
            <div className="flex flex-col gap-2">
              {report.checklist.map(c => (
                <div key={c.key} className="flex items-center gap-3 py-1.5">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                    c.pass ? "bg-[var(--good)] text-white" : "bg-[var(--bad-tint)] border border-[#f1c9c9]"
                  )}>
                    {c.pass ? <Check size={11} /> : <X size={11} className="text-[var(--bad)]" />}
                  </div>
                  <span className={cn("text-[13px]", c.pass ? "text-[var(--ink-2)]" : "text-[var(--ink)]")}>
                    {CHECKLIST_LABELS[c.key] ?? c.key.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[var(--ink-4)] text-center pb-4">
            Scope: {report.scope.from} → {report.scope.to} · {report.scope.sources.length ? report.scope.sources.join(", ") : "all sources"} · Generated {new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
