import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-[12px] font-semibold text-[var(--ink)]">
        {label}
        {required && <span className="text-[var(--bad)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[var(--ink-3)]">{hint}</p>}
      {error && <p className="text-[11px] text-[var(--bad)]">{error}</p>}
    </div>
  );
}

// Re-usable input / select / textarea styles
export const inputCls = "w-full px-3 py-2 text-[13px] border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors";
export const selectCls = inputCls + " cursor-pointer";
