import { useState } from "react";
import { useSession } from "@/app/SessionContext";
import { ConfirmModal } from "@/components/ConfirmModal";
import { cn, roleLabel, roleClass } from "@/lib/utils";
import type { Role } from "@/types/governance";
import { Badge } from "@/components/Badge";
import { CheckCircle, Server, Database, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { session, switchRole, logout } = useSession();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [confirmRole, setConfirmRole] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!session) return null;

  function applyRole() {
    if (!pendingRole) return;
    setConfirmRole(true);
  }

  function doSwitchRole() {
    if (!pendingRole) return;
    switchRole(pendingRole);
    setPendingRole(null);
    setConfirmRole(false);
  }

  function doReset() {
    setConfirmReset(false);
    setResetDone(true);
    setSeedDone(false);
  }

  function doSeed() {
    setSeedDone(true);
  }

  const roleCls = roleClass(session.role) as Parameters<typeof Badge>[0]["variant"];

  return (
    <div className="p-6 max-w-[680px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--ink)] tracking-tight">Settings</h1>
        <p className="text-[13px] text-[var(--ink-3)] mt-0.5">POC access control and demo configuration</p>
      </div>

      {resetDone && (
        <div className="mb-4 p-3 bg-[var(--warn-tint)] border border-[#f0dfb4] rounded-lg text-[13px] text-[var(--warn)]">
          Demo data was reset — seed to start.
        </div>
      )}

      {/* Tenant */}
      <section className="bg-white border border-[var(--line)] rounded-xl p-5 mb-4">
        <h2 className="text-[13px] font-semibold text-[var(--ink)] mb-3 uppercase tracking-wider text-[var(--ink-4)]">Tenant</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-[var(--ink-3)]">Name</span>
            <span className="text-[13px] font-medium text-[var(--ink)]">{session.tenantName}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">Tenant ID</span>
            <span className="font-mono text-[12px] text-[var(--ink-2)]">{session.tenantId}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">Environment</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--warn-tint)] border border-[#f0dfb4] rounded-full text-[11px] text-[var(--warn)] font-medium">
              Demo Mode
            </span>
          </div>
        </div>
      </section>

      {/* Current user */}
      <section className="bg-white border border-[var(--line)] rounded-xl p-5 mb-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--ink-4)] mb-3">Current User</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-[var(--ink-3)]">Display name</span>
            <span className="text-[13px] font-medium text-[var(--ink)]">{session.userName}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">User ID</span>
            <span className="font-mono text-[12px] text-[var(--ink-2)]">{session.userId}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">Current role</span>
            <Badge variant={roleCls} dot>{roleLabel(session.role)}</Badge>
          </div>
        </div>
      </section>

      {/* Role switcher */}
      <section className="bg-white border border-[var(--line)] rounded-xl p-5 mb-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--ink-4)] mb-3">Role Switcher</h2>
        <p className="text-[12px] text-[var(--ink-3)] mb-4">Select a role to demo each persona. This updates your active session.</p>
        <div className="flex flex-col gap-2 mb-4">
          {(["tenant_admin", "compliance_manager", "reviewer"] as Role[]).map(r => (
            <label key={r} className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              (pendingRole ?? session.role) === r
                ? "border-[var(--accent)] bg-[var(--accent-tint)]"
                : "border-[var(--line)] hover:border-[var(--accent)]/40"
            )}>
              <input
                type="radio"
                name="role"
                value={r}
                checked={(pendingRole ?? session.role) === r}
                onChange={() => setPendingRole(r === session.role ? null : r)}
                className="accent-[var(--accent)]"
              />
              <div>
                <div className={cn("text-[13px] font-medium", (pendingRole ?? session.role) === r ? "text-[var(--accent)]" : "text-[var(--ink)]")}>
                  {roleLabel(r)}
                </div>
                <div className="text-[11px] text-[var(--ink-3)]">
                  {r === "tenant_admin" && "Full configuration access"}
                  {r === "compliance_manager" && "Governance oversight and audit"}
                  {r === "reviewer" && "Review AI recommendations"}
                </div>
              </div>
            </label>
          ))}
        </div>
        <button
          disabled={!pendingRole || pendingRole === session.role}
          onClick={applyRole}
          className={cn(
            "px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors",
            pendingRole && pendingRole !== session.role
              ? "bg-[var(--accent)] text-white hover:bg-blue-900"
              : "bg-[var(--line)] text-[var(--ink-4)] cursor-not-allowed"
          )}
        >
          Apply Role
        </button>
      </section>

      {/* Demo data */}
      {session.role === "tenant_admin" && (
        <section className="bg-white border border-[var(--line)] rounded-xl p-5 mb-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--ink-4)] mb-3">Demo Data</h2>
          <div className="flex gap-3">
            <button
              onClick={doSeed}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--good-tint)] border border-[#cfe2d4] text-[var(--good)] text-[13px] font-medium hover:bg-[#daeee1] transition-colors"
            >
              <Database size={14} />
              {seedDone ? <><CheckCircle size={14} /> Seeded!</> : "Seed demo data"}
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bad-tint)] border border-[#f1c9c9] text-[var(--bad)] text-[13px] font-medium hover:bg-red-100 transition-colors"
            >
              <RotateCcw size={14} /> Reset demo data
            </button>
          </div>
          <p className="text-[11px] text-[var(--ink-3)] mt-2">Seed creates use case + workflow + 2 mappings + 5 events. Reset clears all generated data.</p>
        </section>
      )}

      {/* About */}
      <section className="bg-white border border-[var(--line)] rounded-xl p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--ink-4)] mb-3">About</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-[var(--ink-3)]">Version</span>
            <span className="font-mono text-[12px] text-[var(--ink-2)]">v0.1.0 · POC</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">Stack</span>
            <span className="text-[12px] text-[var(--ink-2)]">React 18 · React Router · TanStack Query · Zod</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">API status</span>
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--good)]">
              <Server size={12} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--good)]" />
              Mock mode (local data)
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--ink-3)]">Session started</span>
            <span className="font-mono text-[12px] text-[var(--ink-2)]">{new Date(session.loggedInAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--line)]">
          <button
            onClick={logout}
            className="text-[13px] text-[var(--bad)] hover:underline"
          >
            Sign out
          </button>
        </div>
      </section>

      <ConfirmModal
        open={confirmRole}
        title={`Switch to ${roleLabel(pendingRole ?? "tenant_admin")}?`}
        body={`Some screens and actions will change based on the new role. This updates your demo session.`}
        confirmLabel="Switch role"
        onConfirm={doSwitchRole}
        onCancel={() => setConfirmRole(false)}
      />

      <ConfirmModal
        open={confirmReset}
        title="Reset demo data?"
        body="This will clear all generated events, reviews, and notices. This action cannot be undone."
        tone="danger"
        confirmLabel="Reset"
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
