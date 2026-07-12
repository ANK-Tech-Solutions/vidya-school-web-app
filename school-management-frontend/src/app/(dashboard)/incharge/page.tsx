"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bus, ChartNoAxesCombined, IdCard, Link2, MapPinned, Route } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { inchargeService } from "@/services/incharge.service";
import type { DashboardStats } from "@/types/dashboard";

export default function InchargeDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  useEffect(() => {
    inchargeService.dashboard().then(setStats).catch(() => toast.error("Could not load fleet overview"));
  }, []);

  const cards = [
    { label: "Active buses", value: stats?.activeBuses, icon: Bus },
    { label: "Drivers online", value: stats?.driversOnline, icon: IdCard },
    { label: "Running trips", value: stats?.runningTrips, icon: MapPinned },
    { label: "Completed today", value: stats?.completedTripsToday, icon: ChartNoAxesCombined },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Vehicle incharge"
        title="Fleet operations"
        description="Manage buses, routes, drivers, and live transport activity."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) =>
          stats ? (
            <Card key={label} className="p-5">
              <Icon className="text-[var(--primary)]" size={20} />
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 font-display text-3xl font-bold">{value ?? 0}</p>
            </Card>
          ) : (
            <Card key={label} className="p-5">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="mt-6 h-8 w-16" />
            </Card>
          ),
        )}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/incharge/buses", label: "Buses", icon: Bus },
          { href: "/incharge/routes", label: "Routes", icon: Route },
          { href: "/incharge/drivers", label: "Drivers", icon: IdCard },
          { href: "/incharge/assignments", label: "Assignments", icon: Link2 },
          { href: "/incharge/tracking", label: "Live tracking", icon: MapPinned },
          { href: "/incharge/reports", label: "Reports", icon: ChartNoAxesCombined },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 font-semibold hover:bg-[var(--muted)]">
            <Icon className="text-[var(--primary)]" size={18} />
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
