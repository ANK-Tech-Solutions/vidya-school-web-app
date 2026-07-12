"use client";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useAuth } from "@/hooks/use-auth";
import { primaryRole, type Role } from "@/lib/constants";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoadingScreen />;
  const role = (primaryRole(user.roles) ?? "STUDENT") as Role;
  return (
    <AuthGuard>
      <AppShell role={role}>{children}</AppShell>
    </AuthGuard>
  );
}
