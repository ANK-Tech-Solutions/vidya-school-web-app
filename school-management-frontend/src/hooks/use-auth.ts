"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { user, accessToken, refreshToken, hasHydrated, setAuth, clearAuth } = useAuthStore();
  return { user, accessToken, refreshToken, hasHydrated, isAuthenticated: Boolean(accessToken && user), setAuth, clearAuth };
}
