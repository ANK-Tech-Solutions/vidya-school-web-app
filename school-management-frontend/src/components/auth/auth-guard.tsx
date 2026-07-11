"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/layout/loading-screen";
export function AuthGuard({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, isAuthenticated, hasHydrated } = useAuth(); const router = useRouter();
  useEffect(() => { if (hasHydrated && (!isAuthenticated || (roles && !user?.roles.some((role) => roles.includes(role))))) router.replace("/login"); }, [hasHydrated, isAuthenticated, roles, router, user]);
  if (!hasHydrated || !isAuthenticated || (roles && !user?.roles.some((role) => roles.includes(role)))) return <LoadingScreen />;
  return <>{children}</>;
}
