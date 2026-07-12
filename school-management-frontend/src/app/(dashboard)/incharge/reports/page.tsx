"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { inchargeService } from "@/services/incharge.service";
import type { ReportSummary } from "@/types/reports";

export default function InchargeReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  useEffect(() => {
    inchargeService.reportSummary().then(setSummary).catch(() => toast.error("Could not load report summary"));
  }, []);

  const items = [
    { label: "Total trips", value: summary?.totalTrips },
    { label: "Completed trips", value: summary?.completedTrips },
    { label: "Emergency trips", value: summary?.emergencyTrips },
    { label: "Active buses", value: summary?.activeBuses },
    { label: "Attendance events", value: summary?.totalAttendance },
    { label: "Students transported", value: summary?.studentsTransported },
  ];

  return (
    <>
      <PageHeader eyebrow="Insights" title="Transport reports" description="Operational summary for the school fleet." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-[var(--muted-foreground)]">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{item.value ?? "—"}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
