"use client";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { driverOpsService } from "@/services/driver-ops.service";
import type { AssignedRoute } from "@/types/driver-ops";

export default function DriverRoutePage() {
  const [route, setRoute] = useState<AssignedRoute | null>(null);
  useEffect(() => { driverOpsService.getRoute().then(setRoute).catch(() => toast.error("Could not load your route")); }, []);
  const stops = [...(route?.stops ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return <><PageHeader eyebrow="Assigned route" title={route?.name ?? "My route"} description={route?.description ?? "Your scheduled stops for today."} />
    <Card className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-bold">{route?.code ?? "Route pending"}</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">{route?.distanceKm ?? "—"} km · {route?.estimatedDurationMins ?? "—"} min</p></div><Badge>{stops.length} stops</Badge></div>
      <div className="mt-7 space-y-0">{stops.map((stop, index) => <div key={stop.id ?? `${stop.name}-${index}`} className="relative flex gap-4 pb-7 last:pb-0"><div className="flex flex-col items-center"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-[var(--primary)]">{index + 1}</span>{index < stops.length - 1 && <span className="mt-1 h-full w-px bg-[var(--border)]" />}</div><div className="pt-1"><p className="font-semibold">{stop.name}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{stop.address ?? "Address not provided"}{stop.pickupTime ? ` · ${stop.pickupTime}` : ""}</p></div></div>)}</div>
      {!stops.length && <div className="flex min-h-48 flex-col items-center justify-center text-center text-[var(--muted-foreground)]"><MapPin size={28} /><p className="mt-3">No stops have been assigned yet.</p></div>}</Card></>;
}
