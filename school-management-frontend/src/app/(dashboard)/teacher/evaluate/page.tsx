"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { academicService } from "@/services/academic.service";

type Exam = { id: number; name: string; grade?: string; section?: string; subject?: string; maxMarks?: number };
type Student = { id: number; name: string; studentCode?: string };
type Mark = { marks: string; grade: string; remarks: string };

function asArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  return [];
}

function toExam(raw: Record<string, unknown>): Exam {
  return {
    id: Number(raw.id ?? raw.examId),
    name: String(raw.name ?? raw.title ?? "Exam"),
    grade: raw.grade as string | undefined,
    section: raw.section as string | undefined,
    subject: raw.subject as string | undefined,
    maxMarks: raw.maxMarks != null ? Number(raw.maxMarks) : undefined,
  };
}

function toStudent(raw: Record<string, unknown>): Student {
  const name =
    (raw.name as string) ??
    (raw.fullName as string) ??
    `${(raw.firstName as string) ?? ""} ${(raw.lastName as string) ?? ""}`.trim();
  return {
    id: Number(raw.id ?? raw.studentId),
    name: name || "Student",
    studentCode: (raw.studentCode as string) ?? undefined,
  };
}

export default function EvaluatePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      academicService
        .get("/api/v1/teacher/exams")
        .then((data) => {
          if (active) setExams(asArray(data).map(toExam).filter((e) => !Number.isNaN(e.id)));
        })
        .catch(() => {
          if (active) toast.error("Could not load exams");
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedExam = exams.find((e) => e.id === examId) ?? null;

  const loadStudents = useCallback((exam: Exam) => {
    const params = new URLSearchParams();
    if (exam.grade) params.set("grade", exam.grade);
    if (exam.section) params.set("section", exam.section);
    const query = params.toString();
    academicService
      .get(`/api/v1/teacher/students${query ? `?${query}` : ""}`)
      .then((data) => {
        setStudents(asArray(data).map(toStudent).filter((s) => !Number.isNaN(s.id)));
        setMarks({});
      })
      .catch(() => toast.error("Could not load students"));
  }, []);

  const save = async (student: Student) => {
    if (!selectedExam) return;
    const entry = marks[student.id];
    if (!entry || entry.marks.trim() === "") {
      toast.error("Enter marks first");
      return;
    }
    setSavingId(student.id);
    try {
      await academicService.update(`/api/v1/teacher/exams/${selectedExam.id}/results/${student.id}`, {
        marksObtained: Number(entry.marks),
        gradeLetter: entry.grade || undefined,
        remarks: entry.remarks || undefined,
      });
      toast.success(`Saved result for ${student.name}`);
    } catch {
      toast.error("Could not save result");
    } finally {
      setSavingId(null);
    }
  };

  const setMark = (id: number, patch: Partial<Mark>) =>
    setMarks((prev) => {
      const base: Mark = prev[id] ?? { marks: "", grade: "", remarks: "" };
      return { ...prev, [id]: { ...base, ...patch } };
    });

  return (
    <>
      <PageHeader
        eyebrow="Academic hub"
        title="Evaluate exams"
        description="Select an exam and record each student's marks. Results publish to students and parents."
      />

      <Card className="mb-5 p-4">
        <label className="mb-2 block text-sm font-semibold">Exam</label>
        <select
          value={examId ?? ""}
          onChange={(event) => {
            const id = event.target.value ? Number(event.target.value) : null;
            setExamId(id);
            const exam = exams.find((e) => e.id === id);
            if (exam) loadStudents(exam);
            else setStudents([]);
          }}
          className="h-11 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="">Select an exam…</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
              {exam.subject ? ` · ${exam.subject}` : ""}
              {exam.grade ? ` · ${exam.grade}${exam.section ? exam.section : ""}` : ""}
              {exam.maxMarks ? ` (max ${exam.maxMarks})` : ""}
            </option>
          ))}
        </select>
      </Card>

      {!selectedExam ? (
        <Card className="p-10 text-center text-sm text-[var(--muted-foreground)]">
          Choose an exam to grade its students.
        </Card>
      ) : !students.length ? (
        <Card className="p-10 text-center text-sm text-[var(--muted-foreground)]">
          No students found for {selectedExam.grade ?? "this"} {selectedExam.section ?? ""}.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Marks{selectedExam.maxMarks ? ` / ${selectedExam.maxMarks}` : ""}</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Remarks</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {students.map((student) => {
                const entry = marks[student.id] ?? { marks: "", grade: "", remarks: "" };
                return (
                  <tr key={student.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{student.name}</p>
                      {student.studentCode ? (
                        <p className="text-xs text-[var(--muted-foreground)]">{student.studentCode}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <Input
                        type="number"
                        value={entry.marks}
                        onChange={(event) => setMark(student.id, { marks: event.target.value })}
                        className="w-24"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Input
                        value={entry.grade}
                        onChange={(event) => setMark(student.id, { grade: event.target.value })}
                        className="w-20"
                        placeholder="A+"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Input
                        value={entry.remarks}
                        onChange={(event) => setMark(student.id, { remarks: event.target.value })}
                        placeholder="Optional"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Button size="sm" variant="outline" disabled={savingId === student.id} onClick={() => save(student)}>
                        <Save size={15} />
                        Save
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
