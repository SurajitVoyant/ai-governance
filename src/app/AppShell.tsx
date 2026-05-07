import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSession, useRole } from "./SessionContext";
import { Badge } from "@/components/Badge";
import { roleLabel, roleClass } from "@/lib/utils";
import {
  LayoutDashboard, GitBranch, Link2, Play,
  Zap, ClipboardCheck, Bell, FileText, Settings,
  ChevronDown, LogOut, Cpu
} from "lucide-react";
import { useState } from "react";

type NavItemDef = { to: string; label: string; icon: React.ReactNode; badge?: string; badgeAlert?: boolean; roles?: string[] };
const navGroups: Array<{ label: string; items: NavItemDef[] }> = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    ],
  },
  {
    label: "Configure",
    items: [
      { to: "/use-cases", label: "AI Use Cases", icon: <Cpu size={15} />, roles: ["tenant_admin", "compliance_manager"] },
      { to: "/workflows", label: "Workflows", icon: <GitBranch size={15} />, roles: ["tenant_admin", "compliance_manager"] },
      { to: "/mappings", label: "Integration Mappings", icon: <Link2 size={15} />, roles: ["tenant_admin"] },
    ],
  },
  {
    label: "Operate",
    items: [
      { to: "/events", label: "Decision Events", icon: <Zap size={15} /> },
      { to: "/reviews", label: "Review Queue", icon: <ClipboardCheck size={15} />, badgeAlert: true, badge: "7" },
      { to: "/notices", label: "Candidate Notices", icon: <Bell size={15} />, badgeAlert: true, badge: "4", roles: ["compliance_manager"] },
    ],
  },
  {
    label: "Audit",
    items: [
      { to: "/audit", label: "Audit Report", icon: <FileText size={15} />, roles: ["compliance_manager"] },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/simulator", label: "Mock ATS Simulator", icon: <Play size={15} />, roles: ["tenant_admin", "compliance_manager"] },
      { to: "/settings", label: "Settings", icon: <Settings size={15} /> },
    ],
  },
];

export function AppShell() {
  const { session, logout, switchRole } = useSession();
  const role = useRole();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!session) return null;

  const roleCls = roleClass(session.role);

  const filteredGroups = navGroups.map(g => ({
    ...g,
    items: g.items.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(role ?? "");
    }),
  })).filter(g => g.items.length > 0);

  return (
    <div className="flex h-full min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="w-[224px] flex-shrink-0 bg-[#fbfaf8] border-r border-[var(--line)] flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--ink)] text-white flex items-center justify-center text-[10px] font-bold">AG</div>
            <span className="text-[13px] font-semibold text-[var(--ink)]">{session.tenantName}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3">
          {filteredGroups.map(g => (
            <div key={g.label} className="mb-4">
              <div className="px-2 mb-1 text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)] font-semibold">
                {g.label}
              </div>
              {g.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] mb-0.5 transition-colors",
                    isActive
                      ? "bg-white text-[var(--ink)] border border-[var(--line)] shadow-sm"
                      : "text-[var(--ink-2)] hover:bg-white/60 hover:text-[var(--ink)]"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[var(--ink-3)]">{item.icon}</span>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={cn(
                      "text-[11px] font-mono px-1.5 py-0.5 rounded-full",
                      item.badgeAlert
                        ? "bg-[var(--warn-tint)] text-[var(--warn)]"
                        : "bg-[var(--line-2)] text-[var(--ink-3)]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-12 flex items-center justify-between px-5 border-b border-[var(--line)] bg-white flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-[12px] text-[var(--ink-2)]">
            <span className="font-mono font-medium">{session.tenantName}</span>
            <span className="text-[var(--ink-4)]">·</span>
            <span className="text-[var(--ink-3)]">Production-like demo</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <Badge variant={roleCls as Parameters<typeof Badge>[0]["variant"]} dot>
              {roleLabel(session.role)}
            </Badge>
            <span className="text-[12px] font-mono text-[var(--ink-3)]">{session.userName}</span>
            <button
              className="flex items-center gap-1 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              onClick={() => setRoleMenuOpen(o => !o)}
            >
              <ChevronDown size={14} />
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--line)] rounded-lg shadow-lg py-1 w-52 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--ink-4)] font-semibold border-b border-[var(--line)] mb-1">
                  Switch Role
                </div>
                {["tenant_admin", "compliance_manager", "reviewer"].map(r => (
                  <button
                    key={r}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--bg)] transition-colors",
                      r === session.role ? "text-[var(--accent)] font-medium" : "text-[var(--ink-2)]"
                    )}
                    onClick={() => {
                      switchRole(r as Parameters<typeof switchRole>[0]);
                      setRoleMenuOpen(false);
                    }}
                  >
                    {roleLabel(r)}
                  </button>
                ))}
                <div className="border-t border-[var(--line)] mt-1 pt-1">
                  <button
                    className="w-full text-left px-3 py-2 text-[13px] text-[var(--bad)] flex items-center gap-2 hover:bg-[var(--bad-tint)] transition-colors"
                    onClick={() => { setRoleMenuOpen(false); logout(); }}
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay to close role menu */}
      {roleMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
      )}
    </div>
  );
}
