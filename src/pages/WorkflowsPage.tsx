import { useState } from "react";
import { Plus, Check, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import { ActionBadge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { FormField, inputCls, selectCls } from "@/components/FormField";
import { Stepper } from "@/components/Stepper";
import { EmptyState } from "@/components/EmptyState";
import { WORKFLOWS, USE_CASES } from "@/lib/mock-data";
import type { Workflow, WorkflowStage, MappingAction } from "@/types/governance";

interface StageFormState {
  name: string;
  key: string;
  aiAssisted: boolean;
  reviewRequired: boolean;
  candidateNoticeRequired: boolean;
  actionOnEnter: MappingAction;
}

const defaultStageForm: StageFormState = {
  name: "",
  key: "",
  aiAssisted: false,
  reviewRequired: false,
  candidateNoticeRequired: false,
  actionOnEnter: "LOG_EVENT",
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS);
  const [filterActive, setFilterActive] = useState<"all" | "active">("all");
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [addStageOpen, setAddStageOpen] = useState(false);
  const [stageForm, setStageForm] = useState<StageFormState>(defaultStageForm);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    businessArea: "Talent Acquisition",
    type: "shortlisting",
    linkedUseCaseId: "",
    active: true,
  });

  const filtered = workflows.filter(
    (wf) => filterActive === "all" || wf.active
  );

  function toggleWorkflowActive(id: string) {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, active: !wf.active } : wf))
    );
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, active: !s.active } : null));
    }
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newWf: Workflow = {
      id: `wf_${Date.now()}`,
      name: createForm.name,
      description: createForm.description,
      businessArea: createForm.businessArea,
      type: createForm.type,
      linkedUseCaseId: createForm.linkedUseCaseId || null,
      active: createForm.active,
      stages: [],
    };
    setWorkflows((prev) => [newWf, ...prev]);
    setCreateOpen(false);
    setCreateForm({
      name: "",
      description: "",
      businessArea: "Talent Acquisition",
      type: "shortlisting",
      linkedUseCaseId: "",
      active: true,
    });
  }

  function handleAddStage(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const newStage: WorkflowStage = {
      id: `st_${Date.now()}`,
      name: stageForm.name,
      key: stageForm.key || stageForm.name.toLowerCase().replace(/\s+/g, "-"),
      order: selected.stages.length + 1,
      aiAssisted: stageForm.aiAssisted,
      reviewRequired: stageForm.reviewRequired,
      candidateNoticeRequired: stageForm.candidateNoticeRequired,
      actionOnEnter: stageForm.actionOnEnter,
    };
    const updatedWf = { ...selected, stages: [...selected.stages, newStage] };
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === selected.id ? updatedWf : wf))
    );
    setSelected(updatedWf);
    setAddStageOpen(false);
    setStageForm(defaultStageForm);
  }

  const linkedUseCaseName = (id: string | null) => {
    if (!id) return null;
    return USE_CASES.find((uc) => uc.id === id)?.name ?? id;
  };

  if (selected) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Back + header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to workflows
          </button>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">{selected.name}</h1>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  selected.active
                    ? "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]"
                    : "bg-[#f7f5f3] border-[var(--line)] text-[var(--ink-3)]"
                }`}
              >
                {selected.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-[13px] text-[var(--ink-3)]">{selected.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[12px] text-[var(--ink-3)]">
              <span>Type: <strong className="text-[var(--ink-2)]">{selected.type}</strong></span>
              <span>·</span>
              <span>Area: <strong className="text-[var(--ink-2)]">{selected.businessArea}</strong></span>
              {selected.linkedUseCaseId && (
                <>
                  <span>·</span>
                  <span>
                    Use Case:{" "}
                    <strong className="text-[var(--ink-2)]">
                      {linkedUseCaseName(selected.linkedUseCaseId)}
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWorkflowActive(selected.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] border border-[var(--line)] rounded-lg text-[var(--ink-2)] hover:bg-[var(--bg)] transition-colors"
            >
              {selected.active ? (
                <ToggleRight size={16} className="text-[var(--good)]" />
              ) : (
                <ToggleLeft size={16} className="text-[var(--ink-4)]" />
              )}
              {selected.active ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => {
                setStageForm(defaultStageForm);
                setAddStageOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
            >
              <Plus size={14} />
              Add Stage
            </button>
          </div>
        </div>

        {/* Stepper */}
        {selected.stages.length > 0 && (
          <div className="bg-white border border-[var(--line)] rounded-xl px-4 py-4 mb-5 overflow-x-auto">
            <h3 className="text-[12px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-3">
              Stage Flow
            </h3>
            <Stepper stages={selected.stages} />
          </div>
        )}

        {/* Stages table */}
        {selected.stages.length === 0 ? (
          <div className="bg-white border border-[var(--line)] rounded-xl">
            <EmptyState
              title="No stages defined"
              body="Add stages to define the workflow progression."
              cta={
                <button
                  onClick={() => setAddStageOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
                >
                  <Plus size={14} />
                  Add Stage
                </button>
              }
            />
          </div>
        ) : (
          <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[#fbfaf8]">
                  {["#", "Name", "Key", "AI Assisted", "Review", "Notice", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-3.5 py-2.5 text-left text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...selected.stages]
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => (
                    <tr
                      key={stage.id}
                      className="border-b border-[var(--line)] last:border-0"
                    >
                      <td className="px-3.5 py-2.5 text-[13px] text-[var(--ink-3)]">
                        {stage.order}
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px] font-medium text-[var(--ink)]">
                        {stage.name}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="font-mono text-[11px] text-[var(--ink-3)] bg-[var(--line-2)] px-1.5 py-0.5 rounded">
                          {stage.key}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]">
                        {stage.aiAssisted ? (
                          <Check size={14} className="text-[var(--good)]" />
                        ) : (
                          <span className="text-[var(--ink-4)]">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]">
                        {stage.reviewRequired ? (
                          <Check size={14} className="text-[var(--good)]" />
                        ) : (
                          <span className="text-[var(--ink-4)]">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]">
                        {stage.candidateNoticeRequired ? (
                          <Check size={14} className="text-[var(--good)]" />
                        ) : (
                          <span className="text-[var(--ink-4)]">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <ActionBadge action={stage.actionOnEnter} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Stage Drawer */}
        <Drawer
          open={addStageOpen}
          onClose={() => setAddStageOpen(false)}
          title="Add Stage"
          subtitle={`Add a stage to ${selected.name}`}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddStageOpen(false)}
                className="px-3.5 py-2 text-[13px] text-[var(--ink-2)] border border-[var(--line)] rounded-lg hover:bg-[var(--bg)] transition-colors"
              >
                Cancel
              </button>
              <button
                form="add-stage-form"
                type="submit"
                className="px-3.5 py-2 text-[13px] bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
              >
                Add Stage
              </button>
            </div>
          }
        >
          <form id="add-stage-form" onSubmit={handleAddStage} className="flex flex-col gap-4">
            <FormField label="Stage Name" required>
              <input
                className={inputCls}
                value={stageForm.name}
                onChange={(e) => setStageForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. AI Shortlist Generated"
                required
              />
            </FormField>

            <FormField label="Stage Key" hint="Auto-generated from name if left blank">
              <input
                className={inputCls}
                value={stageForm.key}
                onChange={(e) => setStageForm((f) => ({ ...f, key: e.target.value }))}
                placeholder="e.g. ai-shortlist-generated"
              />
            </FormField>

            <FormField label="Action on Enter" required>
              <select
                className={selectCls}
                value={stageForm.actionOnEnter}
                onChange={(e) =>
                  setStageForm((f) => ({ ...f, actionOnEnter: e.target.value as MappingAction }))
                }
              >
                <option value="LOG_EVENT">LOG EVENT</option>
                <option value="CREATE_DECISION_EVENT">CREATE DECISION EVENT</option>
                <option value="CREATE_REVIEW_TASK">CREATE REVIEW TASK</option>
              </select>
            </FormField>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stageForm.aiAssisted}
                  onChange={(e) => setStageForm((f) => ({ ...f, aiAssisted: e.target.checked }))}
                  className="accent-[var(--accent)] w-4 h-4"
                />
                <span className="text-[13px] text-[var(--ink-2)]">AI Assisted</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stageForm.reviewRequired}
                  onChange={(e) =>
                    setStageForm((f) => ({ ...f, reviewRequired: e.target.checked }))
                  }
                  className="accent-[var(--accent)] w-4 h-4"
                />
                <span className="text-[13px] text-[var(--ink-2)]">Review Required</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stageForm.candidateNoticeRequired}
                  onChange={(e) =>
                    setStageForm((f) => ({ ...f, candidateNoticeRequired: e.target.checked }))
                  }
                  className="accent-[var(--accent)] w-4 h-4"
                />
                <span className="text-[13px] text-[var(--ink-2)]">Candidate Notice Required</span>
              </label>
            </div>
          </form>
        </Drawer>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Workflows</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-1">
            {workflows.filter((wf) => wf.active).length} active workflow
            {workflows.filter((wf) => wf.active).length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
        >
          <Plus size={14} />
          Create Workflow
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "active"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
              filterActive === f
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "bg-white border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--bg)]"
            }`}
          >
            {f === "all" ? "All" : "Active only"}
          </button>
        ))}
      </div>

      {/* Workflow cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[var(--line)] rounded-xl">
          <EmptyState
            title="No workflows found"
            body="Create a workflow to define AI-governed hiring stages."
            cta={
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
              >
                <Plus size={14} />
                Create Workflow
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((wf) => {
            const ucName = linkedUseCaseName(wf.linkedUseCaseId);
            return (
              <div
                key={wf.id}
                onClick={() => setSelected(wf)}
                className="bg-white border border-[var(--line)] rounded-xl p-4 cursor-pointer hover:border-[var(--accent)]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-[15px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                        {wf.name}
                      </h3>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
                          wf.active
                            ? "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]"
                            : "bg-[#f7f5f3] border-[var(--line)] text-[var(--ink-3)]"
                        }`}
                      >
                        {wf.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--ink-3)] mb-2 line-clamp-1">
                      {wf.description}
                    </p>
                    <div className="flex items-center gap-3 text-[12px] text-[var(--ink-3)] flex-wrap">
                      <span className="bg-[var(--line-2)] rounded px-2 py-0.5 capitalize">{wf.type}</span>
                      <span>{wf.businessArea}</span>
                      {ucName && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--accent)]">{ucName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[22px] font-bold tabular-nums text-[var(--ink)]">
                      {wf.stages.length}
                    </div>
                    <div className="text-[11px] text-[var(--ink-4)] uppercase tracking-wide">
                      stage{wf.stages.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Workflow Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Workflow"
        subtitle="Define a new AI governance workflow"
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
              form="create-workflow-form"
              type="submit"
              className="px-3.5 py-2 text-[13px] bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            >
              Create Workflow
            </button>
          </div>
        }
      >
        <form id="create-workflow-form" onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <FormField label="Workflow Name" required>
            <input
              className={inputCls}
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Candidate Shortlisting Workflow"
              required
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputCls} resize-none h-20`}
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe this workflow's purpose…"
            />
          </FormField>

          <FormField label="Business Area" required>
            <select
              className={selectCls}
              value={createForm.businessArea}
              onChange={(e) => setCreateForm((f) => ({ ...f, businessArea: e.target.value }))}
            >
              <option>Talent Acquisition</option>
              <option>People Ops</option>
            </select>
          </FormField>

          <FormField label="Type" required>
            <select
              className={selectCls}
              value={createForm.type}
              onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="shortlisting">Shortlisting</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
            </select>
          </FormField>

          <FormField label="Linked AI Use Case" hint="Optional — link this workflow to a use case">
            <select
              className={selectCls}
              value={createForm.linkedUseCaseId}
              onChange={(e) => setCreateForm((f) => ({ ...f, linkedUseCaseId: e.target.value }))}
            >
              <option value="">None</option>
              {USE_CASES.map((uc) => (
                <option key={uc.id} value={uc.id}>
                  {uc.name}
                </option>
              ))}
            </select>
          </FormField>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={createForm.active}
              onChange={(e) => setCreateForm((f) => ({ ...f, active: e.target.checked }))}
              className="accent-[var(--accent)] w-4 h-4"
            />
            <span className="text-[13px] text-[var(--ink-2)]">Active</span>
          </label>
        </form>
      </Drawer>
    </div>
  );
}
