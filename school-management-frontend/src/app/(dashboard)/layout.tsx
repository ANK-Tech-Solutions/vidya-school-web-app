"use client";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/constants";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoadingScreen />;
  return <AuthGuard><AppShell role={(user.roles[0] ?? "STUDENT") as Role}>{children}</AppShell></AuthGuard>;
}
