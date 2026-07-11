"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@/types/auth";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setAuth: (auth: AuthResponse) => void;
  clearAuth: () => void;
  hydrate: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setAuth: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
      hydrate: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "vidya-bus-auth",
      partialize: ({ user, accessToken, refreshToken }) => ({ user, accessToken, refreshToken }),
      onRehydrateStorage: () => (state) => state?.hydrate(true),
    },
  ),
);
