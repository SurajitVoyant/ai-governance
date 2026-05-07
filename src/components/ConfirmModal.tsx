import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  tone?: "default" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title, body, tone = "default",
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-xl border border-[var(--line)] shadow-xl w-full max-w-[400px] p-5">
        <h3 className="text-[15px] font-semibold text-[var(--ink)] mb-2">{title}</h3>
        <p className="text-[13px] text-[var(--ink-2)] mb-5">{body}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--line-2)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-colors",
              tone === "danger"
                ? "bg-[var(--bad)] text-white hover:bg-red-800"
                : "bg-[var(--accent)] text-white hover:bg-blue-900"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
