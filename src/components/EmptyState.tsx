import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, body, cta, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {icon && <div className="text-[var(--ink-4)] mb-3">{icon}</div>}
      <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-1">{title}</h3>
      {body && <p className="text-[13px] text-[var(--ink-3)] max-w-[40ch] mb-4">{body}</p>}
      {cta}
    </div>
  );
}
