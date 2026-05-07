import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "@/app/SessionContext";
import { TENANTS, DEMO_USERS } from "@/lib/mock-data";
import { roleLabel } from "@/lib/utils";
import type { Role } from "@/types/governance";
import { cn } from "@/lib/utils";
import { ShieldCheck, ChevronDown } from "lucide-react";

const ROLES: Array<{ key: Role; title: string; blurb: string; capabilities: string[] }> = [
  {
    key: "tenant_admin",
    title: "Tenant Admin",
    blurb: "Full configuration access.",
    capabilities: ["Manage use cases", "Configure workflows", "Edit mappings", "Run simulator", "Seed demo data"],
  },
  {
    key: "compliance_manager",
    title: "Compliance Manager",
    blurb: "Governance oversight and audit.",
    capabilities: ["View all screens", "Action reviews", "Manage notices", "Generate audit reports"],
  },
  {
    key: "reviewer",
    title: "Reviewer / Recruiter",
    blurb: "Review AI recommendations.",
    capabilities: ["View decision events", "Accept / Override / Reject", "Request more info"],
  },
];

export default function LoginPage() {
  const [tenant, setTenant] = useState(TENANTS[0]);
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const usersForRole = role ? DEMO_USERS.filter(u => u.role === role) : [];
  const selectedUser = usersForRole.find(u => u.id === userId) ?? usersForRole[0];

  function handleRoleSelect(r: Role) {
    setRole(r);
    const first = DEMO_USERS.find(u => u.role === r);
    setUserId(first?.id ?? "");
  }

  async function handleEnter() {
    if (!role) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const user = selectedUser ?? DEMO_USERS.find(u => u.role === role) ?? DEMO_USERS[0];
    login({
      tenantId: tenant.id,
      tenantName: tenant.name,
      role,
      userId: user.id,
      userName: user.name,
      loggedInAt: new Date().toISOString(),
    });
    const next = searchParams.get("next") ?? "/";
    navigate(next);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[560px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--ink)] mb-4">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">AI Governance POC</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-1">Select your role to enter the demonstration</p>
          <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-[var(--warn-tint)] border border-[#f0dfb4] rounded-full text-[11px] text-[var(--warn)] font-medium">
            Demo mode · no real authentication
          </span>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-sm">
          {/* Tenant selector */}
          <div className="p-5 border-b border-[var(--line)]">
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold mb-2">
              Tenant
            </label>
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 text-[13px] border border-[var(--line)] rounded-lg bg-white text-[var(--ink)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] cursor-pointer pr-8"
                value={tenant.id}
                onChange={e => setTenant(TENANTS.find(t => t.id === e.target.value) ?? TENANTS[0])}
              >
                {TENANTS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-3 text-[var(--ink-4)] pointer-events-none" />
            </div>
          </div>

          {/* Role cards */}
          <div className="p-5 border-b border-[var(--line)]">
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold mb-3">
              Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(r => (
                <button
                  key={r.key}
                  onClick={() => handleRoleSelect(r.key)}
                  className={cn(
                    "text-left p-3.5 rounded-xl border-2 transition-all",
                    role === r.key
                      ? "border-[var(--accent)] bg-[var(--accent-tint)]"
                      : "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--accent)]/50"
                  )}
                >
                  <div className={cn(
                    "text-[12px] font-semibold mb-1",
                    role === r.key ? "text-[var(--accent)]" : "text-[var(--ink)]"
                  )}>
                    {r.title}
                  </div>
                  <div className="text-[11px] text-[var(--ink-3)] mb-2">{r.blurb}</div>
                  <ul className="flex flex-col gap-0.5">
                    {r.capabilities.map(c => (
                      <li key={c} className="text-[10px] text-[var(--ink-3)] flex items-center gap-1">
                        <span className={cn("w-1 h-1 rounded-full flex-shrink-0", role === r.key ? "bg-[var(--accent)]" : "bg-[var(--ink-4)]")} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Demo user selector */}
          {role && usersForRole.length > 0 && (
            <div className="p-5 border-b border-[var(--line)]">
              <label className="block text-[11px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold mb-2">
                Demo user (optional)
              </label>
              <div className="flex gap-2">
                {usersForRole.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUserId(u.id)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg border text-[12px] text-center transition-all",
                      (userId === u.id || (!userId && u === usersForRole[0]))
                        ? "border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)] font-medium"
                        : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--accent)]/50"
                    )}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer / Enter */}
          <div className="p-5 flex items-center justify-between">
            <span className="text-[11px] text-[var(--ink-4)]">Demo mode · v0.1</span>
            <button
              disabled={!role || loading}
              onClick={handleEnter}
              className={cn(
                "px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2",
                role && !loading
                  ? "bg-[var(--ink)] text-white hover:bg-[var(--accent)]"
                  : "bg-[var(--line)] text-[var(--ink-4)] cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entering…
                </>
              ) : (
                <>Enter Dashboard →</>
              )}
            </button>
          </div>
        </div>

        {!role && (
          <p className="text-center text-[12px] text-[var(--ink-4)] mt-4">
            Select a role above to continue
          </p>
        )}
        {role && (
          <p className="text-center text-[12px] text-[var(--ink-3)] mt-4">
            Entering as <strong>{roleLabel(role)}</strong> · {selectedUser?.name ?? ""}
          </p>
        )}
      </div>
    </div>
  );
}
