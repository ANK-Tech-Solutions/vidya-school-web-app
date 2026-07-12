"use client";
import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import { primaryRole } from "@/lib/constants";
export function Topbar() {
  const { user, refreshToken, clearAuth } = useAuth(); const router = useRouter();
  const logout = async () => { try { if (refreshToken) await authService.logout(refreshToken); } finally { clearAuth(); router.replace("/login"); toast.success("Signed out safely"); } };
  const name = user ? `${user.firstName} ${user.lastName}` : "Account";
  const roleLabel = primaryRole(user?.roles)?.replaceAll("_", " ") ?? "Member";
  return <header className="glass-panel flex h-18 items-center justify-end gap-1 rounded-2xl px-3 sm:px-4"><button aria-label="Notifications" className="relative rounded-xl p-2.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"><Bell size={19} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)]" /></button><ThemeToggle /><span className="mx-1 h-7 w-px bg-[var(--border)]" /><div className="hidden text-right sm:block"><p className="text-sm font-bold">{name}</p><p className="text-xs text-[var(--muted-foreground)]">{roleLabel}</p></div><Avatar name={name} /><button onClick={logout} aria-label="Sign out" className="rounded-xl p-2.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-red-500"><LogOut size={18} /></button></header>;
}
