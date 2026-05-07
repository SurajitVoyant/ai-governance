import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  tone?: "default" | "warn" | "good" | "bad";
  onClick?: () => void;
}

export function MetricCard({ label, value, delta, tone = "default", onClick }: MetricCardProps) {
  const valueColor = {
    default: "text-[var(--ink)]",
    warn: "text-[var(--warn)]",
    good: "text-[var(--good)]",
    bad: "text-[var(--bad)]",
  }[tone];

  return (
    <div
      className={cn(
        "bg-white border border-[var(--line)] rounded-lg p-3.5",
        onClick && "cursor-pointer hover:border-[var(--accent)] hover:shadow-sm transition-all"
      )}
      onClick={onClick}
    >
      <div className="text-[11px] text-[var(--ink-3)] uppercase tracking-[0.06em] font-medium">{label}</div>
      <div className={cn("text-2xl font-semibold mt-1 tabular-nums tracking-tight", valueColor)}>{value}</div>
      {delta && <div className="text-[11px] text-[var(--ink-3)] mt-0.5">{delta}</div>}
    </div>
  );
}
