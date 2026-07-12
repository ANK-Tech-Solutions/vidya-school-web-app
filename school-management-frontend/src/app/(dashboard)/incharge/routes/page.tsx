"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { inchargeService } from "@/services/incharge.service";
import type { Route } from "@/types/route";

export default function InchargeRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  useEffect(() => {
    inchargeService
      .routes()
      .then((d) => setRoutes(d.content))
      .catch(() => toast.error("Could not load routes"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Network" title="Routes" description="Review school bus routes and stop counts." />
      <div className="grid gap-3 md:grid-cols-2">
        {routes.map((r) => (
          <Card key={r.id} className="p-5">
            <p className="font-semibold">
              {r.name} <span className="font-normal text-[var(--muted-foreground)]">· {r.code}</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {r.stops?.length ?? 0} stops · {r.distanceKm ?? "—"} km
            </p>
          </Card>
        ))}
        {!routes.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No routes found.</Card>}
      </div>
    </>
  );
}
