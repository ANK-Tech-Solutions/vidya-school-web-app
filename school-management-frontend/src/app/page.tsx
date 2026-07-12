"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useAuth } from "@/hooks/use-auth";
export default function Home() {
  const { user, hasHydrated } = useAuth(); const router = useRouter();
  useEffect(() => { if (!hasHydrated) return; router.replace(user?.roles.includes("ADMIN") ? "/admin" : user?.roles.includes("DRIVER") ? "/driver" : user?.roles.includes("TEACHER") ? "/teacher" : user ? "/student" : "/login"); }, [hasHydrated, router, user]);
  return <LoadingScreen />;
}
