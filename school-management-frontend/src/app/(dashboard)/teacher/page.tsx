"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { academicService } from "@/services/academic.service";

export default function TeacherPage() {
  const [data, setData] = useState<{ students?: number; date?: string } | null>(null);
  useEffect(() => { academicService.get("/api/v1/teacher/dashboard").then((x) => setData(x as unknown as { students?: number; date?: string })).catch(() => toast.error("Could not load teacher dashboard")); }, []);
  const links = [{ href: "/teacher/attendance", label: "Mark attendance", icon: ClipboardCheck }, { href: "/teacher/homework", label: "Set homework", icon: BookOpen }, { href: "/teacher/students", label: "View students", icon: Users }];
  return <><PageHeader eyebrow="Teaching day" title="Ready for your class." description="Manage today’s learning activities from one focused place." /><div className="grid gap-4 sm:grid-cols-2"><Card className="p-6"><p className="text-sm text-[var(--muted-foreground)]">Students at your school</p><p className="mt-2 font-display text-4xl font-bold">{data?.students ?? "—"}</p></Card><Card className="p-6"><p className="text-sm text-[var(--muted-foreground)]">Today</p><p className="mt-2 font-display text-2xl font-bold">{data?.date ?? "Loading…"}</p></Card></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Card className="p-5 transition hover:-translate-y-0.5"><Icon className="text-[var(--primary)]" /><p className="mt-4 font-semibold">{label}</p></Card></Link>)}</div></>;
}
