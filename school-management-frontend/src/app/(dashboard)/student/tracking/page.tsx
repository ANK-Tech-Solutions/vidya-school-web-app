"use client";

import { useCallback, useState } from "react";
import { Clock3, Gauge, MapPinned, Radio, Route } from "lucide-react";
import { StudentSelector } from "@/components/student/student-selector";
import { LiveMap } from "@/components/maps/live-map";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { useLiveTracking } from "@/hooks/use-live-tracking";

export default function TrackingPage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const { location: tracking, connected, error, lastUpdated } = useLiveTracking(studentId);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);
  const speed = tracking?.speed !== undefined && tracking.speed !== null ? `${Math.round(tracking.speed * 3.6)} km/h` : "Not available";
  const distance = tracking?.distanceRemainingKm !== undefined && tracking.distanceRemainingKm !== null ? `${tracking.distanceRemainingKm.toFixed(1)} km` : "Not available";
  const status = tracking?.trip?.status?.replaceAll("_", " ") ?? tracking?.status?.replaceAll("_", " ") ?? "No active trip";
  const stats = [
    { label: "Live connection", value: connected ? "Connected" : "Polling", icon: Radio },
    { label: "Current speed", value: speed, icon: Gauge },
    { label: "Distance remaining", value: distance, icon: Route },
    { label: "Estimated arrival", value: tracking?.eta ?? tracking?.trip?.eta ?? "Not available", icon: Clock3 },
  ];

  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader eyebrow="Live journey" title="Bus tracking" description="Follow the bus in real time. If the live connection drops, location refreshes every five seconds." /><StudentSelector onChange={selectStudent} /></div>
    {!tracking && !error ? <Skeleton className="h-96 w-full" /> : <div className="space-y-6">
      {error && <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-3"><Card className="overflow-hidden p-0 lg:col-span-2"><LiveMap className="h-[30rem] w-full rounded-none" schoolLat={tracking?.schoolLatitude} schoolLng={tracking?.schoolLongitude} pickupLat={tracking?.pickupLatitude} pickupLng={tracking?.pickupLongitude} busLat={tracking?.latitude} busLng={tracking?.longitude} busHeading={tracking?.heading} /></Card>
        <Card className="p-5"><MapPinned className="text-[var(--primary)]" size={20} /><p className="mt-4 text-sm text-[var(--muted-foreground)]">Trip status</p><p className="mt-1 font-bold">{status}</p><p className="mt-5 text-xs text-[var(--muted-foreground)]">{lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleTimeString()}` : "Awaiting location update"}</p></Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <Card key={label} className="p-5"><Icon className="text-[var(--primary)]" size={19} /><p className="mt-4 text-sm text-[var(--muted-foreground)]">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></Card>)}</div>
    </div>}
  </>;
}
