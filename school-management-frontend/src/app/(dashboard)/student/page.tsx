"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, BusFront, CalendarDays, Clock3, FileCheck2, MapPin, Navigation, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { StudentSelector } from "@/components/student/student-selector";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { studentOpsService } from "@/services/student-ops.service";
import type { StudentDashboard } from "@/types/student-ops";

export default function StudentPage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);

  useEffect(() => {
    studentOpsService.getDashboard(studentId).then(setDashboard).catch(() => toast.error("Could not load your journey")).finally(() => setLoading(false));
  }, [studentId]);

  const trip = dashboard?.trip;
  const cards = [
    { label: "Bus", value: dashboard?.bus?.busNumber ?? dashboard?.bus?.registrationNumber ?? "Not assigned", icon: BusFront, color: "text-[var(--primary)]" },
    { label: "Driver", value: dashboard?.driver?.name || [dashboard?.driver?.firstName, dashboard?.driver?.lastName].filter(Boolean).join(" ") || "Not assigned", icon: UserRound, color: "text-[var(--accent)]" },
    { label: "Route", value: dashboard?.route?.name ?? "Not assigned", icon: MapPin, color: "text-[var(--primary)]" },
    { label: "ETA to your stop", value: dashboard?.eta ?? trip?.eta ?? "Not available", icon: Clock3, color: "text-emerald-500" },
  ];

  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader eyebrow="Your journey" title="Travel with confidence." description="Keep track of every important part of today’s bus journey." /><StudentSelector onChange={selectStudent} /></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{loading ? Array.from({ length: 4 }, (_, index) => <Card key={index} className="p-5"><Skeleton className="h-5 w-5" /><Skeleton className="mt-5 h-4 w-16" /><Skeleton className="mt-2 h-6 w-32" /></Card>) : cards.map(({ label, value, icon: Icon, color }) => <Card key={label} className="p-5"><Icon size={20} className={color} /><p className="mt-5 text-sm text-[var(--muted-foreground)]">{label}</p><p className="mt-1 truncate text-lg font-bold">{value}</p></Card>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><Card className="p-6"><ShieldCheck className="text-emerald-500" size={23} /><p className="mt-5 text-sm text-[var(--muted-foreground)]">Trip status</p><h2 className="mt-1 font-display text-2xl font-bold">{trip?.status?.replaceAll("_", " ") ?? "No active trip"}</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Your stop: {dashboard?.studentStopName ?? dashboard?.route?.pickupStop ?? "To be confirmed"}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Bus near: {dashboard?.currentStopName ?? "Waiting for live GPS"}</p>{dashboard?.distanceRemainingKm != null && <p className="mt-1 text-sm text-[var(--muted-foreground)]">Distance remaining: {dashboard.distanceRemainingKm.toFixed(1)} km</p>}</Card>
      <Card className="p-6"><h2 className="font-display text-xl font-bold">Student hub</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{[{ href: "/student/tracking", label: "Track bus", icon: Navigation }, { href: "/student/attendance", label: "Class attendance", icon: ShieldCheck }, { href: "/student/timetable", label: "Timetable", icon: CalendarDays }, { href: "/student/homework", label: "Homework", icon: BookOpen }, { href: "/student/exams", label: "Exams", icon: FileCheck2 }, { href: "/student/fees", label: "Fees", icon: ReceiptText }].map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-sm font-semibold hover:bg-[var(--muted)]"><Icon size={18} className="text-[var(--primary)]" />{label}</Link>)}</div></Card></div>
  </>;
}
