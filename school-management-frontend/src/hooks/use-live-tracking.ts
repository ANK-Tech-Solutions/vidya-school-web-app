"use client";

import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_URL } from "@/lib/constants";
import { studentOpsService } from "@/services/student-ops.service";
import { useAuthStore } from "@/stores/auth-store";
import type { StudentTracking } from "@/types/student-ops";

const pollingIntervalMs = 5_000;

function socketUrl() {
  return `${API_URL.replace(/\/$/, "")}/ws`;
}

export function useLiveTracking(studentId?: number) {
  const token = useAuthStore((state) => state.accessToken);
  const [location, setLocation] = useState<StudentTracking | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let pollId: number | undefined;
    let client: Client | undefined;

    const refresh = async () => {
      try {
        const tracking = await studentOpsService.getTracking(studentId);
        if (disposed) return null;
        setLocation(tracking);
        setLastUpdated(tracking.updatedAt ?? new Date().toISOString());
        return tracking;
      } catch {
        if (!disposed) setError("Unable to refresh the bus location.");
        return null;
      }
    };

    const startPolling = () => {
      if (pollId !== undefined || disposed) return;
      setConnected(false);
      void refresh();
      pollId = window.setInterval(() => void refresh(), pollingIntervalMs);
    };

    const connect = (tripId: number) => {
      client = new Client({
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        webSocketFactory: () => new SockJS(socketUrl()),
        reconnectDelay: 0,
        connectionTimeout: 10_000,
        onConnect: () => {
          if (disposed || !client) return;
          setConnected(true);
          setError(null);
          client.subscribe(`/topic/trips/${tripId}/location`, (message) => {
            try {
              const update = JSON.parse(message.body) as StudentTracking;
              setLocation((current) => ({ ...current, ...update }));
              setLastUpdated(update.updatedAt ?? new Date().toISOString());
            } catch {
              setError("Received an invalid live location update.");
            }
          });
        },
        onStompError: () => {
          if (disposed) return;
          setError("Live connection failed; refreshing location every five seconds.");
          startPolling();
        },
        onWebSocketError: () => {
          if (disposed) return;
          setError("Live connection failed; refreshing location every five seconds.");
          startPolling();
        },
        onWebSocketClose: () => {
          if (!disposed) startPolling();
        },
      });
      client.activate();
    };

    void refresh().then((tracking) => {
      if (disposed) return;
      const tripId = tracking?.trip?.id;
      if (tripId) connect(tripId);
      else startPolling();
    });

    return () => {
      disposed = true;
      if (pollId !== undefined) window.clearInterval(pollId);
      void client?.deactivate();
    };
  }, [studentId, token]);

  return { location, connected, error, lastUpdated };
}
