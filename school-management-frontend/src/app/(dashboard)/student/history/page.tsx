"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { StudentSelector } from "@/components/student/student-selector";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { studentOpsService } from "@/services/student-ops.service";
import type { StudentTrip } from "@/types/student-ops";

export default function StudentHistoryPage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [trips, setTrips] = useState<StudentTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);
  useEffect(() => { studentOpsService.getTripHistory(studentId).then(setTrips).catch(() => toast.error("Could not load trip history")).finally(() => setLoading(false)); }, [studentId]);
  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader eyebrow="Past journeys" title="Trip history" description="See your previous school bus journeys." /><StudentSelector onChange={selectStudent} /></div>
    <Card className="overflow-hidden">{loading ? <div className="space-y-4 p-5">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div> : trips.length ? <div className="divide-y divide-[var(--border)]">{trips.map((trip, index) => <div key={trip.id ?? index} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-semibold">{trip.routeName ?? "School route"}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{trip.startedAt ? new Date(trip.startedAt).toLocaleString() : "Date unavailable"}{trip.busNumber ? ` · ${trip.busNumber}` : ""}</p></div><div className="flex items-center gap-3"><p className="text-sm text-[var(--muted-foreground)]">{trip.endedAt ? `Ended ${new Date(trip.endedAt).toLocaleTimeString()}` : ""}</p><Badge>{trip.status ?? "Completed"}</Badge></div></div>)}</div> : <EmptyState title="No trip history" description="Completed bus journeys will appear here." />}</Card>
  </>;
}
