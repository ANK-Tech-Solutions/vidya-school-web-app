"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { Bus, BusStatus } from "@/types/bus";

const statuses: BusStatus[] = ["ACTIVE", "MAINTENANCE", "INACTIVE", "RETIRED"];

export default function InchargeBusesPage() {
  return (
    <>
      <PageHeader eyebrow="Fleet" title="Buses" description="Create and manage every school vehicle and its operating status." />
      <EntityManager<Bus>
        title="Buses"
        fields={[
          { name: "busNumber", label: "Bus number" },
          { name: "plateNumber", label: "Plate number" },
          { name: "capacity", label: "Capacity", type: "number" },
          { name: "make", label: "Make" },
          { name: "model", label: "Model" },
          { name: "status", label: "Status", options: statuses.map((value) => ({ value, label: value })) },
        ]}
        list={inchargeService.listBuses}
        create={inchargeService.createBus}
        update={inchargeService.updateBus}
        deactivate={inchargeService.deactivateBus}
        canDeactivate={(b) => b.status !== "INACTIVE" && b.status !== "RETIRED"}
        coerce={(value) => ({
          ...value,
          capacity: value.capacity === "" || value.capacity == null ? undefined : Number(value.capacity),
          status: value.status || "ACTIVE",
        })}
        row={(b) => (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">
                {b.busNumber} <span className="font-normal text-[var(--muted-foreground)]">· {b.plateNumber}</span>
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {b.make ?? "Bus"} {b.model ?? ""} · {b.capacity} seats
              </p>
            </div>
            <Badge variant={b.status === "ACTIVE" ? "default" : b.status === "MAINTENANCE" ? "amber" : "slate"}>{b.status}</Badge>
          </div>
        )}
      />
    </>
  );
}
