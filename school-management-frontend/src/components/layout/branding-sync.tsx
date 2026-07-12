"use client";

import { useEffect } from "react";
import { brandingService } from "@/services/branding.service";
import { useBrandingStore } from "@/stores/branding-store";

export function BrandingSync({ authenticated = false }: { authenticated?: boolean }) {
  const setBranding = useBrandingStore((state) => state.setBranding);
  useEffect(() => {
    (authenticated ? brandingService.current : brandingService.public)()
      .then((branding) => {
        setBranding(branding);
        document.title = branding.appName;
      })
      .catch(() => undefined);
  }, [authenticated, setBranding]);
  return null;
}
