"use client";

import { useCallback, useEffect, useState } from "react";
import { driverLocationRuntime } from "@/lib/driver-location-runtime";
import type { LocationPayload } from "@/types/driver-ops";

export function useDriverLocation() {
  const [enabled, setEnabled] = useState(false);
  const [lastFix, setLastFix] = useState<LocationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsOk, setGpsOk] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => driverLocationRuntime.subscribe((snapshot) => {
    setEnabled(snapshot.enabled);
    setLastFix(snapshot.lastFix);
    setError(snapshot.error);
    setGpsOk(snapshot.gpsOk);
    setOnline(snapshot.online);
  }), []);

  const enable = useCallback(async () => driverLocationRuntime.enable(), []);
  const disable = useCallback(async () => driverLocationRuntime.disable(), []);

  return { enabled, lastFix, error, gpsOk, online, enable, disable };
}
