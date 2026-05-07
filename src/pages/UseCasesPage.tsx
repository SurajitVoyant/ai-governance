import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge, RiskBadge, StatusBadge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { FormField, inputCls, selectCls } from "@/components/FormField";
import { USE_CASES } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import type { AiUseCase, RiskLevel, ImpactLevel, EntityStatus } from "@/types/governance";

interface FormState {
  name: string;
  key: string;
  description: string;
  businessArea: string;
  category: string;
  riskLevel: RiskLevel;
  impactLevel: ImpactLevel;
  humanReviewRequired: boolean;
  candidateNoticeRequired: boolean;
  status: EntityStatus;
}

const defaultForm: FormState = {
  name: "",
  key: "",
  description: "",
  businessArea: "Talent Acquisition",
  category: "Shortlisting",
  riskLevel: "low",
  impactLevel: "decision_support",
  humanReviewRequired: false,
  candidateNoticeRequired: false,
  status: "draft",
};

export default function UseCasesPage() {
  const [useCases, setUseCases] = useState<AiUseCase[]>(USE_CASES);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | EntityStatus>("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<AiUseCase | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);

  const filtered = useCases.filter((uc) => {
    const matchSearch =
      !search ||
      uc.name.toLowerCase().includes(search.toLowerCase()) ||
      uc.key.toLowerCase().includes(search.toLowerCase()) ||
      uc.businessArea.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || uc.riskLevel === riskFilter;
    const matchStatus = statusFilter === "all" || uc.status === statusFilter;
    return matchSearch && matchRisk && matchStatus;
  });

  function openDetail(uc: AiUseCase) {
    setSelectedUseCase(uc);
    setDetailOpen(true);
  }

  function openCreate() {
    setForm(defaultForm);
    setCreateOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    const newUc: AiUseCase = {
      id: `uc_${Date.now()}`,
      key: form.key || form.name.toLowerCase().replace(/\s+/g, "-"),
      name: form.name,
      description: form.description,
      businessArea: form.businessArea,
      category: form.category,
      riskLevel: form.riskLevel,
      impactLevel: form.impactLevel,
      humanReviewRequired: form.humanReviewRequired,
      candidateNoticeRequired: form.candidateNoticeRequired,
      status: form.status,
      createdAt: now,
      updatedAt: now,
    };
    setUseCases((prev) => [newUc, ...prev]);
    setCreateOpen(false);
    alert("Use case saved");
  }

  const columns: Column<AiUseCase>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <span className="font-semibold text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer">
          {row.name}
        </span>
      ),
    },
    {
      key: "key",
      header: "Key",
      render: (row) => (
        <span className="font-mono text-[11px] text-[var(--ink-3)] bg-[var(--line-2)] px-1.5 py-0.5 rounded">
          {row.key}
        </span>
      ),
    },
    {
      key: "businessArea",
      header: "Business Area",
      render: (row) => <span>{row.businessArea}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (row) => <span>{row.category}</span>,
    },
    {
      key: "riskLevel",
      header: "Risk",
      render: (row) => <RiskBadge level={row.riskLevel} />,
    },
    {
      key: "impactLevel",
      header: "Impact",
      render: (row) => (
        <Badge variant="default">
          {row.impactLevel === "decision_support" ? "Support" : "Replacement"}
        </Badge>
      ),
    },
    {
      key: "humanReviewRequired",
      header: "Review",
      render: (row) =>
        row.humanReviewRequired ? (
          <Check size={14} className="text-[var(--good)]" />
        ) : (
          <span className="text-[var(--ink-4)]">—</span>
        ),
    },
    {
      key: "candidateNoticeRequired",
      header: "Notice",
      render: (row) =>
        row.candidateNoticeRequired ? (
          <Check size={14} className="text-[var(--good)]" />
        ) : (
          <span className="text-[var(--ink-4)]">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (row) => (
        <span className="text-[var(--ink-3)] text-[12px]">
          {formatRelativeTime(row.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">AI Use Cases</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-1">
            {useCases.length} use case{useCases.length !== 1 ? "s" : ""} defined
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
        >
          <Plus size={14} />
          Create Use Case
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search use cases…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} max-w-[260px]`}
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as "all" | RiskLevel)}
          className={`${selectCls} max-w-[160px]`}
        >
          <option value="all">All risks</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | EntityStatus)}
          className={`${selectCls} max-w-[160px]`}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(row) => row.id}
        selectedId={selectedUseCase?.id}
        onRowClick={openDetail}
        emptyTitle="No AI use cases yet"
        emptyBody="Create your first AI use case to start tracking governance."
        emptyCta={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            <Plus size={14} />
            Create Use Case
          </button>
        }
      />

      {/* Detail Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedUseCase?.name ?? ""}
        subtitle={selectedUseCase?.key}
      >
        {selectedUseCase && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 flex-wrap">
              <RiskBadge level={selectedUseCase.riskLevel} />
              <StatusBadge status={selectedUseCase.status} />
              <Badge variant="default">
                {selectedUseCase.impactLevel === "decision_support" ? "Decision Support" : "Decision Replacement"}
              </Badge>
            </div>

            <DetailRow label="Description" value={selectedUseCase.description} />
            <DetailRow label="Business Area" value={selectedUseCase.businessArea} />
            <DetailRow label="Category" value={selectedUseCase.category} />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--line)]">
                <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-wider mb-1">Human Review</div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)]">
                  {selectedUseCase.humanReviewRequired ? (
                    <>
                      <Check size={14} className="text-[var(--good)]" />
                      Required
                    </>
                  ) : (
                    <span className="text-[var(--ink-3)]">Not required</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--line)]">
                <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-wider mb-1">Candidate Notice</div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)]">
                  {selectedUseCase.candidateNoticeRequired ? (
                    <>
                      <Check size={14} className="text-[var(--good)]" />
                      Required
                    </>
                  ) : (
                    <span className="text-[var(--ink-3)]">Not required</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--line)] pt-4">
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <div className="text-[var(--ink-4)] uppercase tracking-wider text-[10px] mb-0.5">Created</div>
                  <div className="text-[var(--ink-2)]">{formatRelativeTime(selectedUseCase.createdAt)}</div>
                </div>
                <div>
                  <div className="text-[var(--ink-4)] uppercase tracking-wider text-[10px] mb-0.5">Updated</div>
                  <div className="text-[var(--ink-2)]">{formatRelativeTime(selectedUseCase.updatedAt)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[var(--ink-4)] uppercase tracking-wider text-[10px] mb-0.5">ID</div>
                  <div className="font-mono text-[11px] text-[var(--ink-3)]">{selectedUseCase.id}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Use Case"
        subtitle="Define a new AI use case for governance tracking"
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
              form="create-use-case-form"
              type="submit"
              className="px-3.5 py-2 text-[13px] bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            >
              Save Use Case
            </button>
          </div>
        }
      >
        <form id="create-use-case-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Name" required>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Candidate Shortlisting"
              required
            />
          </FormField>

          <FormField label="Use Case Key" hint="Auto-generated from name if left blank">
            <input
              className={inputCls}
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="e.g. candidate-shortlisting-v1"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className={`${inputCls} resize-none h-20`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this use case does…"
            />
          </FormField>

          <FormField label="Business Area" required>
            <select
              className={selectCls}
              value={form.businessArea}
              onChange={(e) => setForm((f) => ({ ...f, businessArea: e.target.value }))}
            >
              <option>Talent Acquisition</option>
              <option>People Ops</option>
            </select>
          </FormField>

          <FormField label="Category" required>
            <select
              className={selectCls}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              <option>Shortlisting</option>
              <option>Screening</option>
              <option>Ranking</option>
              <option>Summary</option>
              <option>Comms</option>
            </select>
          </FormField>

          <FormField label="Risk Level" required>
            <div className="flex gap-4">
              {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="riskLevel"
                    value={level}
                    checked={form.riskLevel === level}
                    onChange={() => setForm((f) => ({ ...f, riskLevel: level }))}
                    className="accent-[var(--accent)]"
                  />
                  <span className="text-[13px] text-[var(--ink-2)] capitalize">{level}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Decision Impact" required>
            <div className="flex flex-col gap-2">
              {(["decision_support", "decision_replacement"] as ImpactLevel[]).map((impact) => (
                <label key={impact} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="impactLevel"
                    value={impact}
                    checked={form.impactLevel === impact}
                    onChange={() => setForm((f) => ({ ...f, impactLevel: impact }))}
                    className="accent-[var(--accent)]"
                  />
                  <span className="text-[13px] text-[var(--ink-2)]">
                    {impact === "decision_support" ? "Decision Support" : "Decision Replacement"}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.humanReviewRequired}
                onChange={(e) => setForm((f) => ({ ...f, humanReviewRequired: e.target.checked }))}
                className="accent-[var(--accent)] w-4 h-4"
              />
              <span className="text-[13px] text-[var(--ink-2)]">Human Review Required</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.candidateNoticeRequired}
                onChange={(e) =>
                  setForm((f) => ({ ...f, candidateNoticeRequired: e.target.checked }))
                }
                className="accent-[var(--accent)] w-4 h-4"
              />
              <span className="text-[13px] text-[var(--ink-2)]">Candidate Notice Required</span>
            </label>
          </div>

          <FormField label="Status" required>
            <select
              className={selectCls}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EntityStatus }))}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </form>
      </Drawer>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--ink-4)] mb-0.5">{label}</div>
      <div className="text-[13px] text-[var(--ink-2)]">{value || <span className="text-[var(--ink-4)]">—</span>}</div>
    </div>
  );
}
