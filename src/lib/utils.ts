import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function truncateId(id: string, len = 12): string {
  return id.length > len ? id.slice(0, len) + "…" : id;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    tenant_admin: "Tenant Admin",
    compliance_manager: "Compliance Manager",
    reviewer: "Reviewer",
  };
  return map[role] ?? role;
}

export function roleClass(role: string): string {
  const map: Record<string, string> = {
    tenant_admin: "role-admin",
    compliance_manager: "role-comp",
    reviewer: "role-rev",
  };
  return map[role] ?? "";
}
