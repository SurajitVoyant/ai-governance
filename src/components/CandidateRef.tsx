import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateRefProps {
  hash: string;
  applicationId?: string;
  className?: string;
}

export function CandidateRef({ hash, applicationId, className }: CandidateRefProps) {
  const [copied, setCopied] = useState(false);
  const display = hash.startsWith("sha256:") ? hash.slice(7, 19) + "…" : hash.slice(0, 12) + "…";

  function copy() {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[12px]", className)}>
      <span className="bg-[var(--line-2)] border border-[var(--line)] rounded px-1.5 py-0.5 text-[var(--ink-2)]">
        {display}
      </span>
      {applicationId && (
        <span className="text-[var(--ink-3)]">{applicationId}</span>
      )}
      <button onClick={copy} className="text-[var(--ink-4)] hover:text-[var(--ink-2)] transition-colors p-0.5 rounded">
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </button>
    </span>
  );
}
