import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, title, subtitle, footer, children, width = "w-[560px]" }: DrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      <div className={cn(
        "fixed top-0 right-0 h-full bg-white border-l border-[var(--line)] z-50 flex flex-col shadow-xl transition-transform duration-200",
        width,
        open ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--line)] flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-600 text-[var(--ink)]">{title}</h2>
            {subtitle && <p className="text-[12px] text-[var(--ink-3)] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--ink-4)] hover:text-[var(--ink)] transition-colors p-1 rounded hover:bg-[var(--line-2)] ml-4 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--line)] flex-shrink-0 bg-[var(--bg)]">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
