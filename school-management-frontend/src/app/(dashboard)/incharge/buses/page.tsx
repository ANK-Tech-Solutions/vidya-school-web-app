"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { Bus } from "@/types/bus";

export default function InchargeBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  useEffect(() => {
    inchargeService
      .buses()
      .then((d) => setBuses(d.content))
      .catch(() => toast.error("Could not load buses"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Fleet" title="Buses" description="Monitor vehicle status across the school fleet." />
      <div className="grid gap-3 md:grid-cols-2">
        {buses.map((b) => (
          <Card key={b.id} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">
                {b.busNumber} · {b.plateNumber}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {b.make ?? "Bus"} {b.model ?? ""} · {b.capacity} seats
              </p>
            </div>
            <Badge variant={b.status === "ACTIVE" ? "default" : "slate"}>{b.status}</Badge>
          </Card>
        ))}
        {!buses.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No buses found.</Card>}
      </div>
    </>
  );
}
