import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

interface JsonViewerProps {
  value: unknown;
  defaultCollapsed?: boolean;
}

export function JsonViewer({ value, defaultCollapsed = false }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(value, null, 2);

  function copy() {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-[#0c0e10] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          {collapsed ? "Expand" : "Collapse"}
        </button>
        <button onClick={copy} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {!collapsed && (
        <pre className="p-4 overflow-auto text-[12px] font-mono text-[#e6e6e3] leading-relaxed max-h-[400px]">
          {json}
        </pre>
      )}
    </div>
  );
}
