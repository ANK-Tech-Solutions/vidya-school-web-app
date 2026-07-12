"use client";

import { create } from "zustand";
import { DEFAULT_BRANDING } from "@/lib/constants";
import type { Branding } from "@/services/branding.service";

interface BrandingState extends Branding {
  setBranding: (branding: Branding) => void;
}

export const useBrandingStore = create<BrandingState>((set) => ({
  ...DEFAULT_BRANDING,
  setBranding: (branding) => set(branding),
}));
