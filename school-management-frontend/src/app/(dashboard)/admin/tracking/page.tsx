"use client";

import { useEffect, useState } from "react";
import { BusFront, MapPin, Radio, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { adminDashboardService } from "@/services/admin-dashboard.service";
import { driverService } from "@/services/driver.service";
import type { DashboardStats } from "@/types/dashboard";
import type { Driver } from "@/types/driver";

function formatWhen(value?: string | null) {
  if (!value) return "No GPS yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No GPS yet";
  return date.toLocaleString();
}

export default function AdminTrackingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d] = await Promise.all([adminDashboardService.getStats(), driverService.list({ size: 100 })]);
        setStats(s);
        setDrivers(d.content);
      } catch {
        toast.error("Could not refresh live tracking");
      }
    };
    load();
    const interval = window.setInterval(load, 5_000);
    return () => window.clearInterval(interval);
  }, []);

  const runningTrips = stats?.runningTrips ?? 0;
  const online = drivers.filter((d) => d.online);
  const withGps = drivers
    .filter((d) => d.lastLatitude != null && d.lastLongitude != null)
    .sort((a, b) => {
      const at = a.lastLocationAt ? new Date(a.lastLocationAt).getTime() : 0;
      const bt = b.lastLocationAt ? new Date(b.lastLocationAt).getTime() : 0;
      return bt - at;
    });

  return (
    <>
      <PageHeader
        eyebrow="Fleet operations"
        title="Live tracking"
        description="Monitor online drivers and their latest reported GPS positions."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Radio className="text-[var(--primary)]" size={20} />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">Running trips</p>
          <p className="mt-1 font-display text-3xl font-bold">{runningTrips}</p>
        </Card>
        <Card className="p-5">
          <Wifi className="text-[var(--primary)]" size={20} />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">Drivers online</p>
          <p className="mt-1 font-display text-3xl font-bold">{online.length}</p>
        </Card>
        <Card className="p-5">
          <MapPin className="text-[var(--primary)]" size={20} />
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">With GPS fix</p>
          <p className="mt-1 font-display text-3xl font-bold">{withGps.length}</p>
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-teal-500/10 p-3 text-[var(--primary)]">
            <BusFront size={22} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">Driver locations</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Refreshes every five seconds from the latest driver GPS updates.</p>
          </div>
        </div>
        <div className="mt-6 divide-y">
          {withGps.length ? (
            withGps.map((d) => (
              <div key={d.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {d.firstName} {d.lastName}
                    </p>
                    <Badge variant={d.online ? "default" : "slate"}>{d.online ? "Online" : "Offline"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatWhen(d.lastLocationAt)}</p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-medium">
                    {Number(d.lastLatitude).toFixed(5)}, {Number(d.lastLongitude).toFixed(5)}
                  </p>
                  <a
                    className="text-[var(--primary)] hover:underline"
                    href={`https://www.google.com/maps?q=${d.lastLatitude},${d.lastLongitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-sm text-[var(--muted-foreground)]">
              No driver GPS positions yet. When a driver goes online and shares location, they will appear here.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
