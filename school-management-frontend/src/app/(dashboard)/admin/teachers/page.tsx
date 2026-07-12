"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { teacherService, type TeacherPayload } from "@/services/teacher.service";

const blank: TeacherPayload = { username: "", email: "", password: "", firstName: "", lastName: "", employeeCode: "", department: "", subjects: "" };
export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherPayload[]>([]); const [form, setForm] = useState(blank); const [open, setOpen] = useState(false);
  const load = () => teacherService.list().then((x) => setTeachers(x.content)).catch(() => toast.error("Could not load teachers"));
  useEffect(() => { load(); }, []);
  const save = async (e: React.FormEvent) => { e.preventDefault(); try { await teacherService.create(form); toast.success("Teacher created"); setOpen(false); setForm(blank); load(); } catch { toast.error("Could not create teacher"); } };
  return <><PageHeader eyebrow="People" title="Teachers" description="Manage teacher accounts and teaching profiles." /><div className="mb-5 flex justify-end"><Button onClick={() => setOpen(!open)}>Add teacher</Button></div>{open && <Card className="mb-6 p-5"><form onSubmit={save} className="grid gap-3 sm:grid-cols-2">{(["username", "email", "password", "firstName", "lastName", "employeeCode", "department", "subjects"] as const).map((key) => <Input key={key} required={["username", "email", "firstName", "lastName"].includes(key)} type={key === "password" ? "password" : "text"} placeholder={key.replace(/([A-Z])/g, " $1")} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}<div className="sm:col-span-2"><Button type="submit">Save teacher</Button></div></form></Card>}<Card className="overflow-hidden"><div className="divide-y">{teachers.length ? teachers.map((t, i) => <div key={`${t.username}-${i}`} className="flex items-center justify-between p-4"><div><p className="font-semibold">{t.firstName} {t.lastName}</p><p className="text-sm text-[var(--muted-foreground)]">{t.email} · {t.department || "Teaching"}</p></div><span className="text-xs font-semibold text-[var(--primary)]">{t.employeeCode || "Teacher"}</span></div>) : <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">No teachers yet.</p>}</div></Card></>;
}
