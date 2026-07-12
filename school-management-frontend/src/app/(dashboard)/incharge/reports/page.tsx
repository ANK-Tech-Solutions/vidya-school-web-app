"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { inchargeService } from "@/services/incharge.service";
import type { ReportSummary, TripReportRow } from "@/types/reports";

export default function InchargeReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [trips, setTrips] = useState<TripReportRow[]>([]);

  useEffect(() => {
    Promise.all([inchargeService.reportSummary(), inchargeService.reportTrips()])
      .then(([s, t]) => {
        setSummary(s);
        setTrips(t.content);
      })
      .catch(() => toast.error("Could not load transport reports"));
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
      <PageHeader eyebrow="Insights" title="Transport reports" description="Fleet performance and trip history for your school." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-[var(--muted-foreground)]">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{item.value ?? "—"}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-175 text-left text-sm">
          <thead className="bg-[var(--muted)] text-xs uppercase text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3">Trip</th>
              <th>Driver</th>
              <th>Bus / Route</th>
              <th>Status</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((row) => (
              <tr key={row.tripId}>
                <td className="border-t border-[var(--border)] px-4 py-3">#{row.tripId}</td>
                <td className="border-t border-[var(--border)] px-4 py-3">{row.driverName}</td>
                <td className="border-t border-[var(--border)] px-4 py-3">
                  {row.busNumber} · {row.routeName}
                </td>
                <td className="border-t border-[var(--border)] px-4 py-3">{row.status}</td>
                <td className="border-t border-[var(--border)] px-4 py-3">{row.distanceKm ?? 0} km</td>
              </tr>
            ))}
            {!trips.length && (
              <tr>
                <td className="px-4 py-8 text-[var(--muted-foreground)]" colSpan={5}>
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
