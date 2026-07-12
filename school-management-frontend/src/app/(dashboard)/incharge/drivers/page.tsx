"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { Driver } from "@/types/driver";

export default function InchargeDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  useEffect(() => {
    inchargeService
      .drivers()
      .then((d) => setDrivers(d.content))
      .catch(() => toast.error("Could not load drivers"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Crew" title="Drivers" description="See who is online and available for trips." />
      <div className="grid gap-3 md:grid-cols-2">
        {drivers.map((d) => (
          <Card key={d.id} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">
                {d.firstName} {d.lastName}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">{d.licenseNumber}</p>
            </div>
            <Badge variant={d.online ? "default" : "slate"}>{d.online ? "Online" : "Offline"}</Badge>
          </Card>
        ))}
        {!drivers.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No drivers found.</Card>}
      </div>
    </>
  );
}
