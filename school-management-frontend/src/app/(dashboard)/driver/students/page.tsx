"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, GraduationCap, ScanLine, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ScanBoardDialog, type ScanMethod } from "@/components/driver/scan-board-dialog";
import { driverOpsService } from "@/services/driver-ops.service";
import { apiErrorMessage } from "@/lib/api-error";
import type { TodayStudent } from "@/types/driver-ops";

export default function DriverStudentsPage() {
  const [students, setStudents] = useState<TodayStudent[]>([]);
  const [status, setStatus] = useState<Record<number, "boarded" | "absent">>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    driverOpsService
      .getTodayStudents()
      .then(setStudents)
      .catch(() => {
        setStudents([]);
        toast.error("Could not load today's students");
      });
  }, []);

  const mark = async (studentId: number | undefined, present: boolean) => {
    if (!studentId) return;
    setBusyId(studentId);
    try {
      if (present) await driverOpsService.markBoarded(studentId);
      else await driverOpsService.markAbsent(studentId);
      setStatus((prev) => ({ ...prev, [studentId]: present ? "boarded" : "absent" }));
      toast.success(present ? "Marked boarded" : "Marked absent");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not update. Start a trip first."));
    } finally {
      setBusyId(null);
    }
  };

  const handleScan = async (code: string, method: ScanMethod) => {
    try {
      const result = await driverOpsService.scan(code, method);
      setStatus((prev) => ({ ...prev, [result.studentId]: "boarded" }));
      if (result.alreadyBoarded) toast.info(`${result.name} was already on board`);
      else toast.success(`${result.name} boarded (${result.method})`);
      return result;
    } catch (error) {
      toast.error(apiErrorMessage(error, "No match. Start a trip and check the code."));
      return null;
    }
  };

  const candidates = useMemo(
    () =>
      students
        .filter((student) => student.studentId != null)
        .map((student) => ({
          studentId: student.studentId as number,
          name: (student.name ?? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()) || "Student",
          studentCode: student.studentCode,
          photoUrl: student.photoUrl,
        })),
    [students],
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Passenger list"
          title="Today's students"
          description="Check students on board as they enter. Unboarded students trigger a no-show alert once you pass their stop."
        />
        <Button onClick={() => setScanOpen(true)}>
          <ScanLine size={16} />
          Scan to board
        </Button>
      </div>
      <ScanBoardDialog open={scanOpen} onClose={() => setScanOpen(false)} onSubmit={handleScan} students={candidates} />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-teal-500/10 p-2 text-[var(--primary)]">
              <Users size={19} />
            </span>
            <p className="font-semibold">{students.length} scheduled students</p>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {students.map((student, index) => {
            const name = (student.name ?? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()) || "Student";
            const sid = student.studentId ?? student.id;
            const state = sid ? status[sid] : undefined;
            return (
              <div key={sid ?? index} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--primary)]">
                    <GraduationCap size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
                      {student.stopName ?? "Stop pending"}
                      {student.grade ? ` · ${student.grade}${student.section ? ` ${student.section}` : ""}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {state ? (
                    <Badge variant={state === "boarded" ? "default" : "slate"}>
                      {state === "boarded" ? "On board" : "Absent"}
                    </Badge>
                  ) : (
                    <>
                      <Button size="sm" disabled={busyId === sid} onClick={() => mark(sid, true)}>
                        <Check size={15} />
                        Board
                      </Button>
                      <Button size="sm" variant="outline" disabled={busyId === sid} onClick={() => mark(sid, false)}>
                        <X size={15} />
                        Absent
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!students.length && (
          <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">No students are scheduled for today.</p>
        )}
      </Card>
    </>
  );
}
