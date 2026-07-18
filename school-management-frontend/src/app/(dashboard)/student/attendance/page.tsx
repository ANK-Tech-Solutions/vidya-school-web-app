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
import { academicService, type AcademicRecord } from "@/services/academic.service";
import type { AttendanceRecord } from "@/types/student-ops";

type ClassAttendance = AcademicRecord & {
  attendanceDate?: string;
  status?: string;
  remarks?: string;
};

const statusVariant = (status?: string) => {
  const value = (status ?? "").toUpperCase();
  if (value === "PRESENT" || value === "LATE") return "default" as const;
  if (value === "ABSENT") return "amber" as const;
  return "slate" as const;
};

export default function AttendancePage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [boardingRecords, setBoardingRecords] = useState<AttendanceRecord[]>([]);
  const [classRecords, setClassRecords] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);

  useEffect(() => {
    setLoading(true);
    academicService
      .get(`/api/v1/student/academic/attendance${studentId ? `?studentId=${studentId}` : ""}`)
      .then((data) => setClassRecords(Array.isArray(data) ? (data as ClassAttendance[]) : []))
      .catch(() => toast.error("Could not load attendance"))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    studentOpsService
      .getAttendance(studentId)
      .then(setBoardingRecords)
      .catch(() => setBoardingRecords([]));
  }, [studentId]);

  const present = classRecords.filter((r) => ["PRESENT", "LATE"].includes((r.status ?? "").toUpperCase())).length;
  const total = classRecords.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Journey record"
          title="Attendance"
          description="Attendance is marked by teachers in class. Bus boarding is tracked separately below."
        />
        <StudentSelector onChange={selectStudent} />
      </div>

      {total ? (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-display text-lg font-bold">Class attendance</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {present} of {total} recorded days marked present or late.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-bold text-[var(--primary)]">{rate}%</p>
            <p className="text-xs text-[var(--muted-foreground)]">attendance rate</p>
          </div>
        </Card>
      ) : null}

      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <p className="font-display text-base font-bold">Class attendance (teacher marked)</p>
        </div>
        {loading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : classRecords.length ? (
          <div className="divide-y divide-[var(--border)]">
            {classRecords.map((record, index) => (
              <div key={record.id ?? index} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">
                    {record.attendanceDate
                      ? new Date(record.attendanceDate).toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "Date unavailable"}
                  </p>
                  {record.remarks ? (
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{record.remarks}</p>
                  ) : null}
                </div>
                <Badge variant={statusVariant(record.status)}>{record.status ?? "Recorded"}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No class attendance yet"
            description="Attendance marked by your teacher will appear here."
          />
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <p className="font-display text-base font-bold">Bus boarding history</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Pickup and drop-off check-ins recorded on the bus. This does not count as class attendance.
          </p>
        </div>
        {boardingRecords.length ? (
          <div className="divide-y divide-[var(--border)]">
            {boardingRecords.map((record, index) => (
              <div key={record.id ?? index} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">
                    {record.date ? new Date(record.date).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Date unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Pickup: {record.pickupTime ?? "—"} · Drop-off: {record.dropoffTime ?? "—"}
                  </p>
                  {record.remarks ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">{record.remarks}</p> : null}
                </div>
                <Badge variant="slate">{record.status ?? "Recorded"}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No bus boarding records" description="Boarding check-ins will appear here after a trip." />
        )}
      </Card>
    </>
  );
}
