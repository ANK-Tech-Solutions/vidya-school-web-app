"use client";
import { useEffect, useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { driverOpsService } from "@/services/driver-ops.service";
import type { TodayStudent } from "@/types/driver-ops";

export default function DriverStudentsPage() {
  const [students, setStudents] = useState<TodayStudent[]>([]);
  useEffect(() => { driverOpsService.getTodayStudents().then(setStudents).catch(() => toast.error("Could not load today's students")); }, []);
  return <><PageHeader eyebrow="Passenger list" title="Today's students" description="Review scheduled pickups before you begin the route." />
    <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] p-5"><div className="flex items-center gap-3"><span className="rounded-xl bg-teal-500/10 p-2 text-[var(--primary)]"><Users size={19} /></span><p className="font-semibold">{students.length} scheduled students</p></div></div>
      <div className="divide-y divide-[var(--border)]">{students.map((student, index) => { const name = (student.name ?? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()) || "Student"; return <div key={student.id ?? student.studentId ?? index} className="flex items-center justify-between gap-4 p-5"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--primary)]"><GraduationCap size={18} /></span><div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="mt-1 truncate text-sm text-[var(--muted-foreground)]">{student.grade ? `${student.grade}${student.section ? ` · ${student.section}` : ""}` : student.admissionNumber ?? "Class details unavailable"}</p></div></div><div className="shrink-0 text-right"><Badge>{student.pickupStatus ?? "Scheduled"}</Badge><p className="mt-1 text-xs text-[var(--muted-foreground)]">{student.stopName ?? "Stop pending"}{student.pickupTime ? ` · ${student.pickupTime}` : ""}</p></div></div>; })}</div>
      {!students.length && <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">No students are scheduled for today.</p>}</Card></>;
}
