"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { LiveMap } from "@/components/maps/live-map";
import { RouteTrackPanel } from "@/components/tracking/route-track-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { academicService } from "@/services/academic.service";
import type { RouteTrackStop } from "@/types/student-ops";

type TrackRow = {
  driverId: number;
  driverName?: string;
  online?: boolean;
  latitude?: number;
  longitude?: number;
  busNumber?: string;
  routeName?: string;
  tripStatus?: string;
  stops?: RouteTrackStop[];
};

type FleetStats = {
  onlineDrivers?: number;
  runningTrips?: number;
  activeBuses?: number;
  tracks?: TrackRow[];
};

export default function TeacherTrackingPage() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const fleet = (await academicService.get("/api/v1/teacher/live-tracking-stats")) as FleetStats;
        if (!active) return;
        setStats(fleet);
        setSelectedId((current) => current ?? fleet.tracks?.find((t) => t.latitude != null)?.driverId ?? fleet.tracks?.[0]?.driverId ?? null);
      } catch {
        if (active) toast.error("Could not load live tracking");
      }
    };
    void Promise.resolve().then(load);
    const id = window.setInterval(() => void load(), 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const selected = stats?.tracks?.find((t) => t.driverId === selectedId) ?? null;
  const stops = useMemo(
    () => [...(selected?.stops ?? [])].sort((a, b) => (a.stopOrder ?? 0) - (b.stopOrder ?? 0)),
    [selected],
  );

  const nearestStopId = useMemo(() => {
    if (selected?.latitude == null || selected?.longitude == null || !stops.length) return null;
    let bestId: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const stop of stops) {
      if (stop.id == null || stop.latitude == null || stop.longitude == null) continue;
      const dlat = Number(stop.latitude) - Number(selected.latitude);
      const dlng = Number(stop.longitude) - Number(selected.longitude);
      const dist = dlat * dlat + dlng * dlng;
      if (dist < bestDist) {
        bestDist = dist;
        bestId = stop.id;
      }
    }
    return bestId;
  }, [selected, stops]);

  const nextStopId = useMemo(() => {
    if (nearestStopId == null) return stops[0]?.id ?? null;
    const idx = stops.findIndex((s) => s.id === nearestStopId);
    return stops[idx + 1]?.id ?? null;
  }, [nearestStopId, stops]);

  return (
    <>
      <PageHeader
        eyebrow="Live ops"
        title="Bus tracking"
        description="Follow school routes, stop-by-stop progress, bus status, and live GPS."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Drivers online</p>
          <p className="mt-1 font-display text-3xl font-bold">{stats?.onlineDrivers ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Running trips</p>
          <p className="mt-1 font-display text-3xl font-bold">{stats?.runningTrips ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Active buses</p>
          <p className="mt-1 font-display text-3xl font-bold">{stats?.activeBuses ?? "—"}</p>
        </Card>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(stats?.tracks ?? []).map((track) => (
          <button
            key={track.driverId}
            type="button"
            onClick={() => setSelectedId(track.driverId)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              selectedId === track.driverId ? "border-[var(--primary)] bg-teal-500/10 text-[var(--primary)]" : "border-[var(--border)]"
            }`}
          >
            {track.driverName ?? `Driver ${track.driverId}`}
            <Badge className="ml-2" variant={track.online ? "default" : "slate"}>
              {track.online ? "Online" : "Offline"}
            </Badge>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <LiveMap
              className="h-[28rem] w-full rounded-none"
              busLat={selected.latitude}
              busLng={selected.longitude}
              stops={stops}
              currentStopId={nearestStopId}
            />
          </Card>
          <RouteTrackPanel
            routeName={selected.routeName}
            busNumber={selected.busNumber}
            tripStatus={selected.tripStatus}
            stops={stops}
            currentStopId={nearestStopId}
            nextStopId={nextStopId}
          />
        </div>
      ) : (
        <Card className="p-8 text-sm text-[var(--muted-foreground)]">No assigned fleet routes to track yet.</Card>
      )}
    </>
  );
}
