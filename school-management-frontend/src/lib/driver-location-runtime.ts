import { isAxiosError } from "axios";
import { driverOpsService } from "@/services/driver-ops.service";
import type { LocationPayload } from "@/types/driver-ops";

const queueKey = "vidya-location-queue";
const enabledKey = "vidya-location-enabled";

type Snapshot = {
  enabled: boolean;
  lastFix: LocationPayload | null;
  error: string | null;
  gpsOk: boolean;
  online: boolean;
};

type Listener = (snapshot: Snapshot) => void;

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

/**
 * Module-level GPS runtime so sharing survives route changes and app minimize.
 * Explicit Disable is the only way to stop it (besides permission revoke).
 */
class DriverLocationRuntime {
  private enabled = false;
  private lastFix: LocationPayload | null = null;
  private error: string | null = null;
  private gpsOk = false;
  private online = typeof navigator !== "undefined" ? navigator.onLine : true;
  private watchId: number | null = null;
  private lastSentAt = 0;
  private heartbeatId: number | null = null;
  private wakeLock: WakeLockSentinel | null = null;
  private listeners = new Set<Listener>();
  private bootstrapped = false;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    void this.bootstrap();
    return () => this.listeners.delete(listener);
  }

  snapshot(): Snapshot {
    return {
      enabled: this.enabled,
      lastFix: this.lastFix,
      error: this.error,
      gpsOk: this.gpsOk,
      online: this.online,
    };
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((listener) => listener(snap));
  }

  private async bootstrap() {
    if (this.bootstrapped || typeof window === "undefined") return;
    this.bootstrapped = true;
    window.addEventListener("online", this.onOnline);
    window.addEventListener("offline", this.onOffline);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("pagehide", this.onPageHide);
    window.addEventListener("pageshow", this.onPageShow);

    if (localStorage.getItem(enabledKey) === "1") {
      await this.enable({ resume: true });
    }
  }

  private onOnline = () => {
    this.online = true;
    this.emit();
    void this.flushQueue();
  };

  private onOffline = () => {
    this.online = false;
    this.emit();
  };

  private onVisibility = () => {
    if (!this.enabled) return;
    if (document.visibilityState === "visible") {
      void this.requestWakeLock();
      this.captureOnce();
      this.ensureWatch();
    }
  };

  private onPageHide = () => {
    // Keep watch alive; do not clear on minimize/hide.
  };

  private onPageShow = () => {
    if (!this.enabled) return;
    this.captureOnce();
    this.ensureWatch();
  };

  private queue(payload: LocationPayload) {
    localStorage.setItem(queueKey, JSON.stringify([...readQueue(), payload].slice(-100)));
  }

  private async flushQueue() {
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
  }

  private async sendFix(payload: LocationPayload) {
    this.lastFix = payload;
    this.gpsOk = true;
    this.error = null;
    this.emit();
    if (!navigator.onLine) {
      this.queue(payload);
      return;
    }
    try {
      await this.flushQueue();
      await driverOpsService.sendLocation(payload);
    } catch {
      this.queue(payload);
    }
  }

  private fromPosition(position: GeolocationPosition) {
    const now = Date.now();
    if (now - this.lastSentAt < 5_000) return;
    this.lastSentAt = now;
    void this.sendFix({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: new Date(position.timestamp).toISOString(),
    });
  }

  private captureOnce() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => this.fromPosition(position),
      (error) => {
        this.gpsOk = false;
        this.error = geoErrorMessage(error);
        this.emit();
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );
  }

  private ensureWatch() {
    if (!navigator.geolocation || this.watchId !== null) return;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.fromPosition(position),
      (error) => {
        this.gpsOk = false;
        this.error = geoErrorMessage(error);
        this.emit();
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );
  }

  private startHeartbeat() {
    if (this.heartbeatId !== null) return;
    // Backup while minimized: browsers may throttle watchPosition.
    this.heartbeatId = window.setInterval(() => {
      if (!this.enabled) return;
      this.captureOnce();
    }, 15_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatId !== null) {
      window.clearInterval(this.heartbeatId);
      this.heartbeatId = null;
    }
  }

  private async requestWakeLock() {
    try {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
      this.wakeLock = await navigator.wakeLock.request("screen");
      this.wakeLock.addEventListener("release", () => {
        this.wakeLock = null;
      });
    } catch {
      // Wake Lock is optional; sharing still continues via watch/heartbeat.
    }
  }

  private async releaseWakeLock() {
    try {
      await this.wakeLock?.release();
    } catch {
      // ignore
    }
    this.wakeLock = null;
  }

  private clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async enable(options?: { resume?: boolean }): Promise<string | null> {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const message = "Geolocation is not supported by this browser.";
      this.error = message;
      this.emit();
      return message;
    }
    if (!window.isSecureContext) {
      const message = "Location requires HTTPS. Open the live site on your phone.";
      this.error = message;
      this.emit();
      return message;
    }

    try {
      await driverOpsService.enableLocation();
    } catch (error) {
      const message = apiMessage(error, "Could not enable location sharing on the server.");
      this.error = message;
      this.emit();
      return message;
    }

    this.enabled = true;
    this.error = null;
    localStorage.setItem(enabledKey, "1");
    this.emit();
    this.ensureWatch();
    this.startHeartbeat();
    void this.requestWakeLock();
    if (!options?.resume) this.captureOnce();
    else this.captureOnce();
    return null;
  }

  async disable(): Promise<void> {
    this.clearWatch();
    this.stopHeartbeat();
    await this.releaseWakeLock();
    this.enabled = false;
    this.gpsOk = false;
    localStorage.removeItem(enabledKey);
    this.emit();
    try {
      await driverOpsService.disableLocation();
    } catch {
      // Local stop still wins.
    }
  }
}

export const driverLocationRuntime = new DriverLocationRuntime();
