"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { DashboardStats } from "@/types/dashboard";
import type { Driver } from "@/types/driver";

export default function InchargeTrackingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      inchargeService
        .dashboard()
        .then((s) => {
          if (active) setStats(s);
        })
        .catch(() => {
          if (active) toast.error("Could not refresh tracking");
        });
      inchargeService
        .drivers()
        .then((d) => {
          if (active) setDrivers(d.content.filter((x) => x.lastLatitude != null && x.lastLongitude != null));
        })
        .catch(() => {
          if (active) toast.error("Could not refresh tracking");
        });
    });
    const id = window.setInterval(() => {
      void Promise.resolve().then(async () => {
        try {
          const [s, d] = await Promise.all([inchargeService.dashboard(), inchargeService.drivers()]);
          setStats(s);
          setDrivers(d.content.filter((x) => x.lastLatitude != null && x.lastLongitude != null));
        } catch {
          toast.error("Could not refresh tracking");
        }
      });
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <>
      <PageHeader eyebrow="Live ops" title="Live tracking" description="Running trips and drivers with a recent GPS fix." />
      <Card className="mb-5 p-5">
        <p className="text-sm text-[var(--muted-foreground)]">Running trips</p>
        <p className="font-display text-4xl font-bold">{stats?.runningTrips ?? 0}</p>
      </Card>
      <div className="space-y-3">
        {drivers.map((d) => (
          <Card key={d.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {d.firstName} {d.lastName}
                </p>
                <Badge variant={d.online ? "default" : "slate"}>{d.online ? "Online" : "Offline"}</Badge>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {Number(d.lastLatitude).toFixed(5)}, {Number(d.lastLongitude).toFixed(5)}
              </p>
            </div>
            <a
              className="text-sm text-[var(--primary)] hover:underline"
              href={`https://www.google.com/maps?q=${d.lastLatitude},${d.lastLongitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps
            </a>
          </Card>
        ))}
        {!drivers.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No GPS positions yet.</Card>}
      </div>
    </>
  );
}
