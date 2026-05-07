import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "role-admin" | "role-comp" | "role-rev"
  | "risk-high" | "risk-med" | "risk-low"
  | "status-active" | "status-draft" | "status-inactive"
  | "act-log" | "act-decision" | "act-review"
  | "open" | "in-review" | "closed"
  | "pending" | "accepted" | "overridden" | "rejected" | "more-info"
  | "not-required" | "required" | "logged" | "sent" | "acknowledged"
  | "low" | "medium" | "high";

const variants: Record<BadgeVariant, string> = {
  default: "bg-white border-[var(--line)] text-[var(--ink-2)]",
  "role-admin": "bg-[#f4eefb] border-[#e1d3f1] text-[#5b2a8c]",
  "role-comp": "bg-[var(--accent-tint)] border-[#dde3f4] text-[var(--accent)]",
  "role-rev": "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
  "risk-high": "bg-[var(--bad-tint)] border-[#f1c9c9] text-[var(--bad)]",
  "risk-med": "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  "risk-low": "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
  high: "bg-[var(--bad-tint)] border-[#f1c9c9] text-[var(--bad)]",
  medium: "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  low: "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
  "status-active": "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
  "status-draft": "bg-[#eef0f1] border-[#dee1e3] text-[var(--ink-2)]",
  "status-inactive": "bg-[#f7f5f3] border-[var(--line)] text-[var(--ink-3)]",
  "act-log": "bg-[#eef0f1] border-[#dee1e3] text-[var(--ink-2)]",
  "act-decision": "bg-[var(--accent-tint)] border-[#dde3f4] text-[var(--accent)]",
  "act-review": "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  open: "bg-[var(--info-tint)] border-[#c9dff0] text-[var(--info)]",
  "in-review": "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  closed: "bg-[#eef0f1] border-[#dee1e3] text-[var(--ink-2)]",
  pending: "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  accepted: "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
  overridden: "bg-[var(--accent-tint)] border-[#dde3f4] text-[var(--accent)]",
  rejected: "bg-[var(--bad-tint)] border-[#f1c9c9] text-[var(--bad)]",
  "more-info": "bg-[#f4eefb] border-[#e1d3f1] text-[#5b2a8c]",
  "not-required": "bg-[#f7f5f3] border-[var(--line)] text-[var(--ink-3)]",
  required: "bg-[var(--warn-tint)] border-[#f0dfb4] text-[var(--warn)]",
  logged: "bg-[var(--info-tint)] border-[#c9dff0] text-[var(--info)]",
  sent: "bg-[var(--good-tint)] border-[#cfe2d4] text-[var(--good)]",
  acknowledged: "bg-[var(--accent-tint)] border-[#dde3f4] text-[var(--accent)]",
};

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", dot, children, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
      variants[variant],
      className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const v = level === "high" ? "risk-high" : level === "medium" ? "risk-med" : "risk-low";
  return <Badge variant={v as BadgeVariant}>{level}</Badge>;
}

export function ActionBadge({ action }: { action: string }) {
  const map: Record<string, BadgeVariant> = {
    LOG_EVENT: "act-log",
    CREATE_DECISION_EVENT: "act-decision",
    CREATE_REVIEW_TASK: "act-review",
  };
  return <Badge variant={map[action] ?? "default"}>{action.replace(/_/g, " ")}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active: "status-active", draft: "status-draft", inactive: "status-inactive",
    open: "open", in_review: "in-review", closed: "closed",
    pending: "pending", accepted: "accepted", overridden: "overridden",
    rejected: "rejected", more_info: "more-info",
    not_required: "not-required", required: "required",
    logged: "logged", sent_manually: "sent", acknowledged: "acknowledged",
  };
  const label = status.replace(/_/g, " ");
  return <Badge variant={map[status] ?? "default"}>{label}</Badge>;
}
