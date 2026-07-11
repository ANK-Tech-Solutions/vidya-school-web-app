"use client";

import { useEffect, useState } from "react";
import { BusFront, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { adminDashboardService } from "@/services/admin-dashboard.service";
import type { DashboardStats } from "@/types/dashboard";

export default function AdminTrackingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = () => adminDashboardService.getStats().then(setStats).catch(() => undefined);
    load();
    const interval = window.setInterval(load, 5_000);
    return () => window.clearInterval(interval);
  }, []);

  const runningTrips = stats?.runningTrips ?? 0;

  return <><PageHeader eyebrow="Fleet operations" title="Live tracking" description="A live map for every active trip will appear here as fleet-level tracking becomes available." />
    <div className="mt-6 grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><Card className="p-6"><Radio className="text-[var(--primary)]" size={22} /><p className="mt-5 text-sm text-[var(--muted-foreground)]">Running trips</p><p className="mt-1 font-display text-4xl font-bold">{runningTrips}</p><p className="mt-4 text-sm text-[var(--muted-foreground)]">This count refreshes from the operations dashboard every five seconds.</p></Card>
      <Card className="p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-teal-500/10 p-3 text-[var(--primary)]"><BusFront size={22} /></span><div><h2 className="font-display text-xl font-bold">Active trips</h2><p className="text-sm text-[var(--muted-foreground)]">Trip details will populate as the fleet tracking endpoint is enabled.</p></div></div><p className="mt-8 rounded-xl bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">No individual trip feed is available yet. Use a student&apos;s Live Tracking page to see a bus location.</p></Card>
    </div>
  </>;
}
