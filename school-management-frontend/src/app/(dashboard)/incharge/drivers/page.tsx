"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { Driver } from "@/types/driver";

export default function InchargeDriversPage() {
  return (
    <>
      <PageHeader eyebrow="Crew" title="Drivers" description="Manage driver accounts, licences, and availability for the fleet." />
      <EntityManager<Driver>
        title="Drivers"
        fields={[
          { name: "firstName", label: "First name" },
          { name: "lastName", label: "Last name" },
          { name: "username", label: "Username" },
          { name: "email", label: "Email", type: "email" },
          { name: "licenseNumber", label: "Licence number" },
          { name: "password", label: "Password", type: "password", hint: "Leave blank to use Password@123." },
        ]}
        list={inchargeService.listDrivers}
        create={inchargeService.createDriver}
        update={inchargeService.updateDriver}
        deactivate={inchargeService.deactivateDriver}
        row={(d) => (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">
                {d.firstName} {d.lastName}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {d.licenseNumber} · {d.email}
              </p>
            </div>
            <Badge variant={d.online ? "default" : "slate"}>{d.online ? "Online" : "Offline"}</Badge>
          </div>
        )}
      />
    </>
  );
}
