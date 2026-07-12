"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { LiveMap } from "@/components/maps/live-map";
import { RouteTrackPanel } from "@/components/tracking/route-track-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { inchargeService } from "@/services/incharge.service";
import type { Assignment } from "@/types/assignment";
import type { DashboardStats } from "@/types/dashboard";
import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { RouteTrackStop } from "@/types/student-ops";

export default function InchargeTrackingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [s, d, r, a] = await Promise.all([
          inchargeService.dashboard(),
          inchargeService.drivers(),
          inchargeService.routes(),
          inchargeService.assignments(),
        ]);
        if (!active) return;
        setStats(s);
        setDrivers(d.content);
        setRoutes(r.content);
        setAssignments(a.content.filter((x) => x.active !== false));
        setSelectedId((current) => current ?? d.content.find((x) => x.lastLatitude != null)?.id ?? d.content[0]?.id ?? null);
      } catch {
        if (active) toast.error("Could not refresh tracking");
      }
    };
    void Promise.resolve().then(load);
    const id = window.setInterval(() => void load(), 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const selected = drivers.find((d) => d.id === selectedId) ?? null;
  const assignment = assignments.find((a) => a.type === "DRIVER" && a.driverId === selected?.id);
  const route = routes.find((r) => r.id === assignment?.routeId);
  const stops: RouteTrackStop[] = useMemo(
    () =>
      (route?.stops ?? [])
        .map((s) => ({
          id: s.id,
          name: s.name,
          stopOrder: s.stopOrder,
          latitude: s.latitude,
          longitude: s.longitude,
          address: s.address,
        }))
        .sort((a, b) => (a.stopOrder ?? 0) - (b.stopOrder ?? 0)),
    [route],
  );

  const nearestStopId = useMemo(() => {
    if (!selected?.lastLatitude || !selected?.lastLongitude || !stops.length) return null;
    let bestId: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const stop of stops) {
      if (stop.id == null || stop.latitude == null || stop.longitude == null) continue;
      const dlat = Number(stop.latitude) - Number(selected.lastLatitude);
      const dlng = Number(stop.longitude) - Number(selected.lastLongitude);
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

  const liveDrivers = drivers.filter((d) => d.lastLatitude != null && d.lastLongitude != null);

  return (
    <>
      <PageHeader
        eyebrow="Live ops"
        title="Live tracking"
        description="Watch fleet GPS, route stops, bus status, and progress along each track."
      />
      <Card className="mb-5 p-5">
        <p className="text-sm text-[var(--muted-foreground)]">Running trips</p>
        <p className="font-display text-4xl font-bold">{stats?.runningTrips ?? 0}</p>
      </Card>

      <div className="mb-5 flex flex-wrap gap-2">
        {liveDrivers.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedId(d.id)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              selectedId === d.id ? "border-[var(--primary)] bg-teal-500/10 text-[var(--primary)]" : "border-[var(--border)]"
            }`}
          >
            {d.firstName} {d.lastName}
            <Badge className="ml-2" variant={d.online ? "default" : "slate"}>
              {d.online ? "Online" : "Offline"}
            </Badge>
          </button>
        ))}
        {!liveDrivers.length && <p className="text-sm text-[var(--muted-foreground)]">No GPS positions yet. Ask a driver to enable location.</p>}
      </div>

      {selected && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <LiveMap
              className="h-[28rem] w-full rounded-none"
              busLat={selected.lastLatitude ?? undefined}
              busLng={selected.lastLongitude ?? undefined}
              stops={stops}
              currentStopId={nearestStopId}
            />
          </Card>
          <RouteTrackPanel
            routeName={route?.name ?? assignment?.routeName}
            busNumber={assignment?.busNumber}
            tripStatus={selected.online ? "IN_PROGRESS" : "OFFLINE"}
            stops={stops}
            currentStopId={nearestStopId}
            nextStopId={nextStopId}
            eta={null}
          />
        </div>
      )}
    </>
  );
}
