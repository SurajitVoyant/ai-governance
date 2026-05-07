import { useState } from "react";
import { Plus, FlaskConical } from "lucide-react";
import { ActionBadge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { FormField, inputCls, selectCls } from "@/components/FormField";
import { EmptyState } from "@/components/EmptyState";
import { MAPPINGS, WORKFLOWS, USE_CASES } from "@/lib/mock-data";
import type { IntegrationMapping, AtsSource, MappingAction } from "@/types/governance";

type ActionFilter = "all" | MappingAction;
type SourceFilter = "all" | AtsSource;

const ACTION_COLORS: Record<MappingAction, string> = {
  LOG_EVENT: "#9aa0a6",
  CREATE_DECISION_EVENT: "#1f3a8a",
  CREATE_REVIEW_TASK: "#8a5a00",
};

const SOURCE_LABELS: Record<AtsSource, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  smartrecruiters: "SmartRecruiters",
  mock_ats: "Mock ATS",
};

interface CreateFormState {
  source: AtsSource;
  externalEventType: string;
  externalStageId: string;
  externalStageName: string;
  externalStatus: string;
  workflowId: string;
  workflowStageKey: string;
  useCaseId: string;
  action: MappingAction;
  active: boolean;
}

const defaultForm: CreateFormState = {
  source: "greenhouse",
  externalEventType: "application.stage_changed",
  externalStageId: "",
  externalStageName: "",
  externalStatus: "",
  workflowId: "",
  workflowStageKey: "",
  useCaseId: "",
  action: "LOG_EVENT",
  active: true,
};

export default function MappingsPage() {
  const [mappings, setMappings] = useState<IntegrationMapping[]>(MAPPINGS);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<IntegrationMapping | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(defaultForm);

  const filtered = mappings.filter((m) => {
    const matchAction = actionFilter === "all" || m.action === actionFilter;
    const matchSource = sourceFilter === "all" || m.source === sourceFilter;
    return matchAction && matchSource;
  });

  const useCaseLookup = (id: string | null): string => {
    if (!id) return "—";
    return USE_CASES.find((uc) => uc.id === id)?.key ?? id;
  };

  const selectedWorkflowStages =
    WORKFLOWS.find((wf) => wf.id === form.workflowId)?.stages ?? [];

  function openDetail(m: IntegrationMapping) {
    setSelectedMapping(m);
    setDetailOpen(true);
  }

  function toggleActive(id: string) {
    setMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
    if (selectedMapping?.id === id) {
      setSelectedMapping((s) => (s ? { ...s, active: !s.active } : null));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedWfStage = selectedWorkflowStages.find(
      (s) => s.key === form.workflowStageKey
    );
    const newMapping: IntegrationMapping = {
      id: `map_${Date.now()}`,
      source: form.source,
      externalEventType: form.externalEventType,
      externalStageId: form.externalStageId,
      externalStageName: form.externalStageName,
      externalStatus: form.externalStatus || null,
      workflowId: form.workflowId,
      workflowStageKey: form.workflowStageKey,
      useCaseId: form.useCaseId || null,
      aiAssisted: selectedWfStage?.aiAssisted ?? false,
      reviewRequired: selectedWfStage?.reviewRequired ?? false,
      candidateNoticeRequired: selectedWfStage?.candidateNoticeRequired ?? false,
      action: form.action,
      active: form.active,
    };
    setMappings((prev) => [newMapping, ...prev]);
    setCreateOpen(false);
    setForm(defaultForm);
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">
            Integration Mappings
          </h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-1">
            {mappings.filter((m) => m.active).length} active mapping
            {mappings.filter((m) => m.active).length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setForm(defaultForm);
            setCreateOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
        >
          <Plus size={14} />
          Create Mapping
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Action filter chips */}
        <div className="flex gap-1.5">
          {(["all", "LOG_EVENT", "CREATE_DECISION_EVENT", "CREATE_REVIEW_TASK"] as ActionFilter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setActionFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                  actionFilter === f
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-white border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--bg)]"
                }`}
              >
                {f === "all" ? "All" : f.replace(/_/g, " ")}
              </button>
            )
          )}
        </div>

        <div className="w-px h-5 bg-[var(--line)]" />

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          className={`${selectCls} max-w-[180px]`}
        >
          <option value="all">All sources</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="smartrecruiters">SmartRecruiters</option>
          <option value="mock_ats">Mock ATS</option>
        </select>
      </div>

      {/* Custom table with rail */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[var(--line)] rounded-xl">
          <EmptyState
            title="No mappings found"
            body="Create your first integration mapping to connect ATS events to governance workflows."
            cta={
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
              >
                <Plus size={14} />
                Create Mapping
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[#fbfaf8]">
                {[
                  "Rail",
                  "Source",
                  "External Stage",
                  "Ext. Status",
                  "→ Internal Stage",
                  "AI Use Case",
                  "Action",
                  "Flags",
                  "Active",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3.5 py-2.5 text-left text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold ${
                      h === "Rail" ? "w-1 p-0" : ""
                    }`}
                  >
                    {h === "Rail" ? "" : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => openDetail(m)}
                  className="border-b border-[var(--line)] last:border-0 cursor-pointer hover:bg-[var(--bg)] transition-colors"
                >
                  {/* Color rail */}
                  <td className="p-0 w-1">
                    <div
                      className="w-1 h-full min-h-[40px]"
                      style={{ backgroundColor: ACTION_COLORS[m.action] }}
                    />
                  </td>

                  {/* Source chip */}
                  <td className="px-3.5 py-2.5 text-[13px]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--line-2)] border border-[var(--line)] text-[var(--ink-2)] text-[11px] font-medium">
                      {SOURCE_LABELS[m.source]}
                    </span>
                  </td>

                  {/* External Stage */}
                  <td className="px-3.5 py-2.5 text-[13px]">
                    <div className="text-[var(--ink)]">{m.externalStageName}</div>
                    <div className="font-mono text-[11px] text-[var(--ink-4)]">{m.externalStageId}</div>
                  </td>

                  {/* Ext. Status */}
                  <td className="px-3.5 py-2.5 text-[13px] text-[var(--ink-3)]">
                    {m.externalStatus ? (
                      <span className="font-mono text-[11px]">{m.externalStatus}</span>
                    ) : (
                      <span className="text-[var(--ink-4)]">—</span>
                    )}
                  </td>

                  {/* Internal Stage */}
                  <td className="px-3.5 py-2.5">
                    <span className="font-mono text-[11px] text-[var(--accent)] bg-[var(--accent-tint)] px-1.5 py-0.5 rounded">
                      {m.workflowStageKey}
                    </span>
                  </td>

                  {/* AI Use Case */}
                  <td className="px-3.5 py-2.5 text-[13px]">
                    {m.useCaseId ? (
                      <span className="font-mono text-[11px] text-[var(--ink-2)] bg-[var(--line-2)] px-1.5 py-0.5 rounded">
                        {useCaseLookup(m.useCaseId)}
                      </span>
                    ) : (
                      <span className="text-[var(--ink-4)]">—</span>
                    )}
                  </td>

                  {/* Action badge */}
                  <td className="px-3.5 py-2.5">
                    <ActionBadge action={m.action} />
                  </td>

                  {/* Flags */}
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        title="AI Assisted"
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          m.aiAssisted ? "bg-[var(--accent)]" : "bg-[var(--line)]"
                        }`}
                      />
                      <span
                        title="Review Required"
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          m.reviewRequired ? "bg-[var(--warn)]" : "bg-[var(--line)]"
                        }`}
                      />
                      <span
                        title="Candidate Notice"
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          m.candidateNoticeRequired ? "bg-[var(--good)]" : "bg-[var(--line)]"
                        }`}
                      />
                    </div>
                  </td>

                  {/* Active toggle (visual) */}
                  <td className="px-3.5 py-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive(m.id);
                      }}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                        m.active ? "bg-[var(--good)]" : "bg-[var(--line)]"
                      }`}
                      role="switch"
                      aria-checked={m.active}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          m.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Mapping Detail"
        subtitle={selectedMapping ? `${SOURCE_LABELS[selectedMapping.source]} → ${selectedMapping.workflowStageKey}` : ""}
        footer={
          <button
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 border border-[var(--accent)] text-[var(--accent)] rounded-lg text-[13px] font-medium hover:bg-[var(--accent-tint)] transition-colors"
          >
            <FlaskConical size={14} />
            Test in Simulator
          </button>
        }
      >
        {selectedMapping && (
          <div className="flex flex-col gap-5">
            {/* Rail + action badge */}
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: ACTION_COLORS[selectedMapping.action] }}
              />
              <ActionBadge action={selectedMapping.action} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActive(selectedMapping.id);
                }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ml-auto ${
                  selectedMapping.active ? "bg-[var(--good)]" : "bg-[var(--line)]"
                }`}
                role="switch"
                aria-checked={selectedMapping.active}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    selectedMapping.active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MappingField label="ATS Source" value={SOURCE_LABELS[selectedMapping.source]} />
              <MappingField label="Event Type" value={selectedMapping.externalEventType} mono />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MappingField label="External Stage" value={selectedMapping.externalStageName} />
              <MappingField label="External Stage ID" value={selectedMapping.externalStageId} mono />
            </div>

            <MappingField
              label="External Status"
              value={selectedMapping.externalStatus ?? "—"}
              mono={!!selectedMapping.externalStatus}
            />

            <div className="border-t border-[var(--line)] pt-4">
              <h4 className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-3">
                Internal Mapping
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <MappingField
                  label="Workflow"
                  value={
                    WORKFLOWS.find((wf) => wf.id === selectedMapping.workflowId)?.name ??
                    selectedMapping.workflowId
                  }
                />
                <MappingField label="Stage Key" value={selectedMapping.workflowStageKey} mono />
              </div>
              {selectedMapping.useCaseId && (
                <div className="mt-4">
                  <MappingField label="AI Use Case" value={useCaseLookup(selectedMapping.useCaseId)} mono />
                </div>
              )}
            </div>

            <div className="border-t border-[var(--line)] pt-4">
              <h4 className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-3">
                Flags
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <FlagCell label="AI Assisted" active={selectedMapping.aiAssisted} color="var(--accent)" />
                <FlagCell label="Review Required" active={selectedMapping.reviewRequired} color="var(--warn)" />
                <FlagCell label="Candidate Notice" active={selectedMapping.candidateNoticeRequired} color="var(--good)" />
              </div>
            </div>

            <div className="border-t border-[var(--line)] pt-4">
              <div className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-1.5">ID</div>
              <div className="font-mono text-[11px] text-[var(--ink-4)]">{selectedMapping.id}</div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Mapping Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Mapping"
        subtitle="Map an ATS event to a governance workflow stage"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3.5 py-2 text-[13px] text-[var(--ink-2)] border border-[var(--line)] rounded-lg hover:bg-[var(--bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              form="create-mapping-form"
              type="submit"
              className="px-3.5 py-2 text-[13px] bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            >
              Create Mapping
            </button>
          </div>
        }
      >
        <form id="create-mapping-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="ATS Source" required>
            <select
              className={selectCls}
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as AtsSource }))}
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
              onChange={(e) => setForm((f) => ({ ...f, externalEventType: e.target.value }))}
            >
              <option value="application.stage_changed">application.stage_changed</option>
              <option value="candidate.status_changed">candidate.status_changed</option>
            </select>
          </FormField>

          <FormField label="External Stage ID" required>
            <input
              className={inputCls}
              value={form.externalStageId}
              onChange={(e) => setForm((f) => ({ ...f, externalStageId: e.target.value }))}
              placeholder="e.g. stage_4421"
              required
            />
          </FormField>

          <FormField label="External Stage Name" required>
            <input
              className={inputCls}
              value={form.externalStageName}
              onChange={(e) => setForm((f) => ({ ...f, externalStageName: e.target.value }))}
              placeholder="e.g. AI Shortlist"
              required
            />
          </FormField>

          <FormField label="External Status" hint="Optional — only required for status-based events">
            <input
              className={inputCls}
              value={form.externalStatus}
              onChange={(e) => setForm((f) => ({ ...f, externalStatus: e.target.value }))}
              placeholder="e.g. IN_REVIEW"
            />
          </FormField>

          <FormField label="Internal Workflow" required>
            <select
              className={selectCls}
              value={form.workflowId}
              onChange={(e) =>
                setForm((f) => ({ ...f, workflowId: e.target.value, workflowStageKey: "" }))
              }
              required
            >
              <option value="">Select a workflow…</option>
              {WORKFLOWS.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Internal Workflow Stage" required>
            <select
              className={selectCls}
              value={form.workflowStageKey}
              onChange={(e) => setForm((f) => ({ ...f, workflowStageKey: e.target.value }))}
              disabled={!form.workflowId}
              required
            >
              <option value="">Select a stage…</option>
              {selectedWorkflowStages
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((s) => (
                  <option key={s.id} value={s.key}>
                    {s.order}. {s.name}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="AI Use Case" hint="Optional — link to a use case for AI tracking">
            <select
              className={selectCls}
              value={form.useCaseId}
              onChange={(e) => setForm((f) => ({ ...f, useCaseId: e.target.value }))}
            >
              <option value="">None</option>
              {USE_CASES.map((uc) => (
                <option key={uc.id} value={uc.id}>
                  {uc.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Action" required>
            <div className="flex flex-col gap-2">
              {(["LOG_EVENT", "CREATE_DECISION_EVENT", "CREATE_REVIEW_TASK"] as MappingAction[]).map(
                (action) => (
                  <label key={action} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="action"
                      value={action}
                      checked={form.action === action}
                      onChange={() => setForm((f) => ({ ...f, action }))}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-[13px] text-[var(--ink-2)]">
                      {action.replace(/_/g, " ")}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ACTION_COLORS[action] }}
                    />
                  </label>
                )
              )}
            </div>
          </FormField>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                form.active ? "bg-[var(--good)]" : "bg-[var(--line)]"
              }`}
              role="switch"
              aria-checked={form.active}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  form.active ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-[13px] text-[var(--ink-2)]">Active</span>
          </label>
        </form>
      </Drawer>
    </div>
  );
}

function MappingField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--ink-4)] mb-0.5">{label}</div>
      <div
        className={`text-[13px] text-[var(--ink-2)] ${
          mono ? "font-mono text-[11px] bg-[var(--line-2)] px-1.5 py-0.5 rounded inline-block" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FlagCell({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: string;
}) {
  return (
    <div className="p-2.5 bg-[var(--bg)] rounded-lg border border-[var(--line)] text-center">
      <div
        className="w-3 h-3 rounded-full mx-auto mb-1.5"
        style={{ backgroundColor: active ? color : "var(--line)" }}
      />
      <div className="text-[11px] text-[var(--ink-3)]">{label}</div>
      <div className={`text-[11px] font-medium ${active ? "text-[var(--ink)]" : "text-[var(--ink-4)]"}`}>
        {active ? "Yes" : "No"}
      </div>
    </div>
  );
}
