import { useState } from "react";
import { CheckCircle2, FlaskConical } from "lucide-react";
import { FormField, inputCls, selectCls } from "@/components/FormField";
import { JsonViewer } from "@/components/JsonViewer";
import { USE_CASES, WORKFLOWS, MAPPINGS } from "@/lib/mock-data";

interface SimForm {
  source: string;
  externalEventType: string;
  candidateExternalId: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  externalStageName: string;
  externalStatus: string;
  aiScore: string;
  aiRecommendation: string;
  eventTimestamp: string;
}

interface SimResult {
  matched: boolean;
  mappingId: string;
  action: string;
  useCaseKey: string;
  workflowStageKey: string;
  decisionEventId: string;
  reviewTaskId: string;
  noticeId: string;
  normalisedPayload: object;
}

function nowLocalIso() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

const GREENHOUSE_TEMPLATE: SimForm = {
  source: "greenhouse",
  externalEventType: "application.stage_changed",
  candidateExternalId: "gh_cand_99001",
  applicationId: "app_99001",
  jobId: "job_4501",
  jobTitle: "Senior Product Manager",
  externalStageName: "AI Shortlist",
  externalStatus: "",
  aiScore: "0.87",
  aiRecommendation: "shortlist",
  eventTimestamp: nowLocalIso(),
};

const EMPTY_FORM: SimForm = {
  source: "greenhouse",
  externalEventType: "application.stage_changed",
  candidateExternalId: "",
  applicationId: "",
  jobId: "",
  jobTitle: "",
  externalStageName: "",
  externalStatus: "",
  aiScore: "",
  aiRecommendation: "shortlist",
  eventTimestamp: nowLocalIso(),
};

export default function SimulatorPage() {
  const [form, setForm] = useState<SimForm>(EMPTY_FORM);
  const [result, setResult] = useState<SimResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof SimForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function loadTemplate() {
    setForm({ ...GREENHOUSE_TEMPLATE, eventTimestamp: nowLocalIso() });
    setResult(null);
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Find a matching mapping
    const mapping = MAPPINGS.find(
      m =>
        m.source === form.source &&
        m.externalEventType === form.externalEventType &&
        m.externalStageName.toLowerCase() === form.externalStageName.toLowerCase()
    ) ?? MAPPINGS.find(
      m => m.source === form.source && m.externalEventType === form.externalEventType
    ) ?? MAPPINGS[0];

    const useCase = USE_CASES.find(uc => uc.id === mapping.useCaseId);
    const workflow = WORKFLOWS.find(wf => wf.id === mapping.workflowId);
    const stage = workflow?.stages.find(s => s.key === mapping.workflowStageKey);

    const ts = Date.now();
    const simResult: SimResult = {
      matched: true,
      mappingId: mapping.id,
      action: mapping.action,
      useCaseKey: useCase?.key ?? "candidate-shortlisting-v1",
      workflowStageKey: stage?.key ?? mapping.workflowStageKey,
      decisionEventId: `de_sim_${ts.toString().slice(-5)}`,
      reviewTaskId: `rt_sim_${ts.toString().slice(-5)}`,
      noticeId: `cn_sim_${ts.toString().slice(-5)}`,
      normalisedPayload: {
        source: form.source,
        externalEventType: form.externalEventType,
        candidateExternalId: form.candidateExternalId,
        applicationId: form.applicationId,
        jobId: form.jobId,
        jobTitle: form.jobTitle,
        externalStageName: form.externalStageName,
        externalStatus: form.externalStatus || null,
        aiScore: form.aiScore ? parseFloat(form.aiScore) : null,
        aiRecommendation: form.aiRecommendation || null,
        eventTimestamp: new Date(form.eventTimestamp).toISOString(),
        mappingId: mapping.id,
        workflowId: mapping.workflowId,
        workflowStageKey: mapping.workflowStageKey,
        useCaseId: mapping.useCaseId,
        reviewRequired: mapping.reviewRequired,
        candidateNoticeRequired: mapping.candidateNoticeRequired,
        action: mapping.action,
      },
    };

    setResult(simResult);
    setSubmitted(true);
  }

  const formAsJson = {
    source: form.source,
    externalEventType: form.externalEventType,
    candidateExternalId: form.candidateExternalId,
    applicationId: form.applicationId,
    jobId: form.jobId,
    jobTitle: form.jobTitle,
    externalStageName: form.externalStageName,
    externalStatus: form.externalStatus || null,
    aiScore: form.aiScore ? parseFloat(form.aiScore) : null,
    aiRecommendation: form.aiRecommendation,
    eventTimestamp: form.eventTimestamp ? new Date(form.eventTimestamp).toISOString() : null,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <FlaskConical size={20} className="text-[var(--accent)]" />
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Mock ATS Simulator</h1>
        </div>
        <p className="text-[13px] text-[var(--ink-3)]">
          Simulate incoming ATS webhook events and see how the governance engine resolves mappings, creates decision events, and triggers review tasks.
        </p>
      </div>

      {/* Template loader */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[12px] text-[var(--ink-3)] font-medium">Load template:</span>
        <button
          type="button"
          onClick={loadTemplate}
          className="px-3 py-1.5 text-[12px] font-medium border border-[var(--line)] rounded-lg bg-white text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          Greenhouse AI Shortlist
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[360px_1fr_380px] gap-4 items-start">
          {/* LEFT: Form */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-[13px] font-semibold text-[var(--ink)] mb-0.5">Event Parameters</h2>

            <FormField label="ATS Source" required>
              <select
                className={selectCls}
                value={form.source}
                onChange={e => set("source", e.target.value)}
              >
                <option value="greenhouse">Greenhouse</option>
                <option value="lever">Lever</option>
                <option value="smartrecruiters">SmartRecruiters</option>
                <option value="mock_ats">Mock ATS</option>
              </select>
            </FormField>

            <FormField label="External Event Type" required>
              <select
                className={selectCls}
                value={form.externalEventType}
                onChange={e => set("externalEventType", e.target.value)}
              >
                <option value="application.stage_changed">application.stage_changed</option>
                <option value="candidate.status_changed">candidate.status_changed</option>
              </select>
            </FormField>

            <FormField label="Candidate External ID" required>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. gh_cand_99001"
                value={form.candidateExternalId}
                onChange={e => set("candidateExternalId", e.target.value)}
              />
            </FormField>

            <FormField label="Application ID" required>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. app_88231"
                value={form.applicationId}
                onChange={e => set("applicationId", e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Job ID" required>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="e.g. job_4501"
                  value={form.jobId}
                  onChange={e => set("jobId", e.target.value)}
                />
              </FormField>
              <FormField label="Job Title" required>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="e.g. Sr. Product Manager"
                  value={form.jobTitle}
                  onChange={e => set("jobTitle", e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="External Stage Name" required>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. AI Shortlist"
                value={form.externalStageName}
                onChange={e => set("externalStageName", e.target.value)}
              />
            </FormField>

            <FormField label="External Status" hint="Optional — required for candidate.status_changed events">
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. IN_REVIEW"
                value={form.externalStatus}
                onChange={e => set("externalStatus", e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="AI Score" hint="0 – 1">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  placeholder="0.00"
                  value={form.aiScore}
                  onChange={e => set("aiScore", e.target.value)}
                />
              </FormField>
              <FormField label="AI Recommendation">
                <select
                  className={selectCls}
                  value={form.aiRecommendation}
                  onChange={e => set("aiRecommendation", e.target.value)}
                >
                  <option value="shortlist">shortlist</option>
                  <option value="advance">advance</option>
                  <option value="reject">reject</option>
                  <option value="hold">hold</option>
                </select>
              </FormField>
            </div>

            <FormField label="Event Timestamp" required>
              <input
                className={inputCls}
                type="datetime-local"
                value={form.eventTimestamp}
                onChange={e => set("eventTimestamp", e.target.value)}
              />
            </FormField>

            <button
              type="submit"
              className="w-full mt-1 py-2.5 bg-[var(--accent)] text-white text-[13px] font-semibold rounded-lg hover:bg-[#16306e] transition-colors"
            >
              Send Mock Event
            </button>
          </div>

          {/* MIDDLE: Payload preview */}
          <div className="flex flex-col gap-3">
            <div className="bg-white border border-[var(--line)] rounded-xl p-4">
              <h2 className="text-[13px] font-semibold text-[var(--ink)] mb-3">Payload Preview</h2>
              <JsonViewer value={formAsJson} />
            </div>
          </div>

          {/* RIGHT: Result */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-[var(--ink)] mb-3">Result</h2>
            {!submitted || !result ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FlaskConical size={28} className="text-[var(--ink-4)] mb-3" />
                <p className="text-[13px] text-[var(--ink-3)] max-w-[24ch]">
                  No event sent yet — fill the form and click Send Mock Event
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Matched */}
                <div className="flex items-center gap-2 p-3 bg-[var(--good-tint)] border border-[#cfe2d4] rounded-lg">
                  <CheckCircle2 size={15} className="text-[var(--good)] flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-[var(--good)]">matched: true</span>
                </div>

                {/* Resolution details */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--ink-4)]">Action</span>
                    <span className="text-[12px] font-mono font-medium text-[var(--ink)]">{result.action}</span>
                  </div>
                  <div className="h-px bg-[var(--line)]" />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--ink-4)]">Use Case</span>
                    <span className="text-[12px] font-mono text-[var(--ink-2)]">{result.useCaseKey}</span>
                  </div>
                  <div className="h-px bg-[var(--line)]" />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--ink-4)]">Workflow Stage</span>
                    <span className="text-[12px] font-mono text-[var(--ink-2)]">{result.workflowStageKey}</span>
                  </div>
                </div>

                {/* Created IDs */}
                <div className="border border-[var(--line)] rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-[#fbfaf8] border-b border-[var(--line)]">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)]">Created IDs</span>
                  </div>
                  <div className="divide-y divide-[var(--line)]">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[12px] text-[var(--ink-3)]">Decision Event</span>
                      <a
                        href="/events"
                        className="text-[12px] font-mono text-[var(--accent)] hover:underline"
                      >
                        {result.decisionEventId}
                      </a>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[12px] text-[var(--ink-3)]">Review Task</span>
                      <a
                        href="/reviews"
                        className="text-[12px] font-mono text-[var(--accent)] hover:underline"
                      >
                        {result.reviewTaskId}
                      </a>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[12px] text-[var(--ink-3)]">Notice</span>
                      <span className="text-[12px] font-mono text-[var(--ink-2)]">
                        {result.noticeId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Normalised payload */}
                <div>
                  <h3 className="text-[12px] font-semibold text-[var(--ink)] mb-2">Normalised Payload</h3>
                  <JsonViewer value={result.normalisedPayload} defaultCollapsed={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
