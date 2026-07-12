"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { driverOpsService } from "@/services/driver-ops.service";
import type { LocationPayload } from "@/types/driver-ops";

const queueKey = "vidya-location-queue";

function readQueue(): LocationPayload[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(queueKey) ?? "[]");
    return Array.isArray(value) ? (value as LocationPayload[]) : [];
  } catch {
    return [];
  }
}

function geoErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission is blocked. Enable location for this site in your phone browser settings, then try again.";
    case error.POSITION_UNAVAILABLE:
      return "GPS signal unavailable. Move outdoors or turn on high-accuracy location.";
    case error.TIMEOUT:
      return "Location request timed out. Keep the app open and try Enable location again.";
    default:
      return error.message || "Unable to access your location.";
  }
}

function apiMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
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

  const sendFix = useCallback(
    async (payload: LocationPayload) => {
      setLastFix(payload);
      setGpsOk(true);
      setError(null);
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
    },
    [flushQueue, queue],
  );

  const clearWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const startWatch = useCallback(() => {
    clearWatch();
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
        setError(geoErrorMessage(positionError));
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );
  }, [clearWatch, sendFix]);

  const disable = useCallback(async () => {
    clearWatch();
    setEnabled(false);
    setGpsOk(false);
    try {
      await driverOpsService.disableLocation();
    } catch {
      // Local watcher must still stop if the network request fails.
    }
  }, [clearWatch]);

  const enable = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const message = "Geolocation is not supported by this browser.";
      setError(message);
      return message;
    }
    if (!window.isSecureContext) {
      const message = "Location requires HTTPS. Open the live site (not http://localhost) on your phone.";
      setError(message);
      return message;
    }

    try {
      await driverOpsService.enableLocation();
    } catch (error) {
      const message = apiMessage(error, "Could not enable location sharing on the server.");
      setError(message);
      return message;
    }

    setError(null);
    setEnabled(true);

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lastSentAt.current = Date.now();
          void sendFix({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: new Date(position.timestamp).toISOString(),
          });
          startWatch();
          resolve();
        },
        (positionError) => {
          setGpsOk(false);
          setError(geoErrorMessage(positionError));
          startWatch();
          resolve();
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 },
      );
    });

    return null;
  }, [sendFix, startWatch]);

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
      clearWatch();
    };
  }, [clearWatch, flushQueue]);

  return { enabled, lastFix, error, gpsOk, online, enable, disable };
}
