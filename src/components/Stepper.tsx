import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  stages: Array<{ key: string; name: string }>;
  currentKey?: string;
}

export function Stepper({ stages, currentKey }: StepperProps) {
  const currentIdx = stages.findIndex(s => s.key === currentKey);
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {stages.map((stage, i) => {
        const done = currentKey ? i < currentIdx : false;
        const active = stage.key === currentKey;
        return (
          <div key={stage.key} className="flex items-center min-w-0">
            <div className="flex flex-col items-center gap-1 px-3">
              <div className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold flex-shrink-0",
                done ? "bg-[var(--good)] border-[var(--good)] text-white" :
                active ? "bg-[var(--accent)] border-[var(--accent)] text-white" :
                "bg-white border-[var(--line)] text-[var(--ink-4)]"
              )}>
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span className={cn(
                "text-[11px] text-center leading-tight whitespace-nowrap max-w-[80px] truncate",
                active ? "font-semibold text-[var(--accent)]" :
                done ? "text-[var(--good)]" : "text-[var(--ink-3)]"
              )}>
                {stage.name}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className={cn(
                "h-px w-8 flex-shrink-0",
                done ? "bg-[var(--good)]" : "bg-[var(--line)]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
