"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { academicService } from "@/services/academic.service";

export default function TeacherAttendancePage() {
  const [studentIds, setStudentIds] = useState(""); const [status, setStatus] = useState("PRESENT"); const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const attendance = studentIds.split(",").map(Number).filter(Number.isFinite).map((studentId) => ({ studentId, status })); if (!attendance.length) return toast.error("Enter at least one student ID"); setSaving(true); try { await academicService.markAttendance({ date: new Date().toISOString().slice(0, 10), attendance }); toast.success(`Attendance marked for ${attendance.length} student(s)`); } catch { toast.error("Could not mark attendance"); } finally { setSaving(false); } };
  return <><PageHeader eyebrow="Class register" title="Mark attendance" description="Enter the student IDs for today’s class. Use the Students page to look up a class list." /><Card className="max-w-2xl p-6"><form onSubmit={submit} className="space-y-5"><label className="block text-sm font-semibold">Student IDs (comma separated)<Input value={studentIds} onChange={(e) => setStudentIds(e.target.value)} className="mt-2" placeholder="101, 102, 103" /></label><label className="block text-sm font-semibold">Status<select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 h-10 w-full rounded-xl border bg-transparent px-3"><option>PRESENT</option><option>ABSENT</option><option>LATE</option></select></label><Button disabled={saving} type="submit">{saving ? "Saving…" : "Save attendance"}</Button></form></Card></>;
}
