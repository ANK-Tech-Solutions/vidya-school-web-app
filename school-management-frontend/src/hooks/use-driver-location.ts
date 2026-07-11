"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { driverOpsService } from "@/services/driver-ops.service";
import type { LocationPayload } from "@/types/driver-ops";

const queueKey = "vidya-location-queue";

function readQueue(): LocationPayload[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(queueKey) ?? "[]");
    return Array.isArray(value) ? value as LocationPayload[] : [];
  } catch {
    return [];
  }
}

export function useDriverLocation() {
  const [enabled, setEnabled] = useState(false);
  const [lastFix, setLastFix] = useState<LocationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsOk, setGpsOk] = useState(false);
  const [online, setOnline] = useState(true);
  const watchId = useRef<number | null>(null);
  const lastSentAt = useRef(0);

  const queue = useCallback((payload: LocationPayload) => {
    localStorage.setItem(queueKey, JSON.stringify([...readQueue(), payload].slice(-100)));
  }, []);

  const flushQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const pending = readQueue();
    if (!pending.length) return;
    const remaining: LocationPayload[] = [];
    for (const payload of pending) {
      try {
        await driverOpsService.sendLocation(payload);
      } catch {
        remaining.push(payload);
      }
    }
    localStorage.setItem(queueKey, JSON.stringify(remaining));
  }, []);

  const sendFix = useCallback(async (payload: LocationPayload) => {
    setLastFix(payload);
    setGpsOk(true);
    if (!navigator.onLine) {
      queue(payload);
      return;
    }
    try {
      await flushQueue();
      await driverOpsService.sendLocation(payload);
    } catch {
      queue(payload);
    }
  }, [flushQueue, queue]);

  const disable = useCallback(async () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setEnabled(false);
    setGpsOk(false);
    try {
      await driverOpsService.disableLocation();
    } catch {
      // The local watcher must still stop if the network request fails.
    }
  }, []);

  const enable = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return false;
    }
    try {
      await driverOpsService.enableLocation();
      setError(null);
      setEnabled(true);
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastSentAt.current < 5_000) return;
          lastSentAt.current = now;
          void sendFix({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: new Date(position.timestamp).toISOString(),
          });
        },
        (positionError) => {
          setGpsOk(false);
          setError(positionError.message || "Unable to access your location.");
        },
        { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
      );
      return true;
    } catch {
      setError("Could not enable location sharing.");
      return false;
    }
  }, [sendFix]);

  useEffect(() => {
    const syncOnline = () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) void flushQueue();
    };
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [flushQueue]);

  return { enabled, lastFix, error, gpsOk, online, enable, disable };
}
