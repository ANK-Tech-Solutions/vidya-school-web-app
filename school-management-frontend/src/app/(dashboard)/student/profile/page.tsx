"use client";

import { useCallback, useEffect, useState } from "react";
import { BusFront, Route, UserRound } from "lucide-react";
import { toast } from "sonner";
import { StudentSelector } from "@/components/student/student-selector";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { studentOpsService } from "@/services/student-ops.service";
import type { StudentBus, StudentDriver, StudentProfile, StudentRoute } from "@/types/student-ops";

export default function StudentProfilePage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [bus, setBus] = useState<StudentBus | null>(null);
  const [driver, setDriver] = useState<StudentDriver | null>(null);
  const [route, setRoute] = useState<StudentRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);
  useEffect(() => {
    Promise.all([studentOpsService.getProfile(studentId), studentOpsService.getBus(studentId), studentOpsService.getDriver(studentId), studentOpsService.getRoute(studentId)])
      .then(([nextProfile, nextBus, nextDriver, nextRoute]) => { setProfile(nextProfile); setBus(nextBus); setDriver(nextDriver); setRoute(nextRoute); })
      .catch(() => toast.error("Could not load profile details"))
      .finally(() => setLoading(false));
  }, [studentId]);
  const name = profile?.name || [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Student";
  const driverName = driver?.name || [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "Not assigned";
  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader eyebrow="Student account" title="Profile" description="Your student and transport information." /><StudentSelector onChange={selectStudent} /></div>
    {loading ? <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div> : <div className="grid gap-6 lg:grid-cols-2"><Card className="p-6"><UserRound className="text-[var(--primary)]" size={24} /><h2 className="mt-5 font-display text-2xl font-bold">{name}</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">{profile?.studentCode ?? profile?.admissionNumber ?? "Student ID unavailable"}</p><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-[var(--muted-foreground)]">Class</dt><dd className="mt-1 font-semibold">{[profile?.grade, profile?.section].filter(Boolean).join(" · ") || "Not available"}</dd></div><div><dt className="text-[var(--muted-foreground)]">Parent / guardian</dt><dd className="mt-1 font-semibold">{profile?.parentName ?? "Not available"}</dd></div><div><dt className="text-[var(--muted-foreground)]">Contact</dt><dd className="mt-1 font-semibold">{profile?.phone ?? profile?.email ?? "Not available"}</dd></div><div><dt className="text-[var(--muted-foreground)]">Pickup address</dt><dd className="mt-1 font-semibold">{profile?.pickupAddress ?? "Not available"}</dd></div></dl></Card>
      <Card className="p-6"><BusFront className="text-[var(--accent)]" size={24} /><h2 className="mt-5 font-display text-2xl font-bold">Transport summary</h2><div className="mt-6 space-y-5 text-sm"><div className="flex gap-3"><BusFront size={18} className="text-[var(--primary)]" /><p><span className="text-[var(--muted-foreground)]">Bus</span><br /><span className="font-semibold">{bus?.busNumber ?? bus?.registrationNumber ?? "Not assigned"}</span></p></div><div className="flex gap-3"><UserRound size={18} className="text-[var(--primary)]" /><p><span className="text-[var(--muted-foreground)]">Driver</span><br /><span className="font-semibold">{driverName}{driver?.phone ? ` · ${driver.phone}` : ""}</span></p></div><div className="flex gap-3"><Route size={18} className="text-[var(--primary)]" /><p><span className="text-[var(--muted-foreground)]">Route</span><br /><span className="font-semibold">{route?.name ?? "Not assigned"}{route?.pickupStop ? ` · ${route.pickupStop}` : ""}</span></p></div></div></Card></div>}
  </>;
}
