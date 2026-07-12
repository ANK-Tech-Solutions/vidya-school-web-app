"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useAuth } from "@/hooks/use-auth";
import { homeRouteForRoles } from "@/lib/constants";

export default function Home() {
  const { user, hasHydrated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(user ? homeRouteForRoles(user.roles) : "/login");
  }, [hasHydrated, router, user]);
  return <LoadingScreen />;
}
