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
import type { AttendanceRecord } from "@/types/student-ops";

export default function AttendancePage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);
  useEffect(() => { studentOpsService.getAttendance(studentId).then(setRecords).catch(() => toast.error("Could not load attendance")).finally(() => setLoading(false)); }, [studentId]);
  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader eyebrow="Journey record" title="Attendance" description="Review school bus pickup and drop-off records." /><StudentSelector onChange={selectStudent} /></div>
    <Card className="overflow-hidden">{loading ? <div className="space-y-4 p-5">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div> : records.length ? <div className="divide-y divide-[var(--border)]">{records.map((record, index) => <div key={record.id ?? index} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-semibold">{record.date ? new Date(record.date).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Date unavailable"}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Pickup: {record.pickupTime ?? "—"} · Drop-off: {record.dropoffTime ?? "—"}</p>{record.remarks && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{record.remarks}</p>}</div><Badge>{record.status ?? "Recorded"}</Badge></div>)}</div> : <EmptyState title="No attendance records" description="Your bus attendance will appear here after a trip." />}</Card>
  </>;
}
