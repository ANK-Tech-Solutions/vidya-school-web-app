"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BusFront, CircleCheck, GraduationCap, UsersRound, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/admin/stat-card";
import { adminDashboardService } from "@/services/admin-dashboard.service";
import { notificationService } from "@/services/notification.service";
import type { DashboardStats } from "@/types/dashboard";
import type { Notification } from "@/types/notification";

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null); const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => { Promise.all([adminDashboardService.getStats(), notificationService.list({ size: 4 })]).then(([s, n]) => { setStats(s); setNotifications(n.content); }).catch(() => undefined); }, []);
  const cards = [{ label: "Drivers online", value: stats?.driversOnline, icon: Wifi }, { label: "Students", value: stats?.totalStudents, icon: GraduationCap }, { label: "Parents", value: stats?.totalParents, icon: UsersRound }, { label: "Running trips", value: stats?.runningTrips, icon: BusFront }];
  return <><PageHeader eyebrow="Operations center" title="Good morning, administrator." description="A clear view of your school transport network." />
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => stats ? <StatCard key={card.label} {...card} value={card.value ?? 0} /> : <Card key={card.label} className="p-5"><Skeleton className="h-11 w-11 rounded-xl" /><Skeleton className="mt-6 h-8 w-16" /><Skeleton className="mt-2 h-4 w-28" /></Card>)}</motion.div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><Card className="p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Today&apos;s operations</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">Fleet activity at a glance.</p></div><CircleCheck className="text-[var(--primary)]" /></div><div className="mt-8 grid grid-cols-2 gap-4"><div className="rounded-xl bg-[var(--muted)] p-4"><p className="text-2xl font-bold">{stats?.activeBuses ?? "—"}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Active buses</p></div><div className="rounded-xl bg-[var(--muted)] p-4"><p className="text-2xl font-bold">{stats?.completedTripsToday ?? "—"}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Trips completed</p></div></div></Card>
      <Card className="p-6"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Recent updates</h2><Link href="/admin/notifications" className="text-sm font-semibold text-[var(--primary)]">View all</Link></div><div className="mt-4 space-y-4">{notifications.length ? notifications.map((n) => <div key={n.id} className="flex gap-3"><Bell size={17} className="mt-0.5 text-[var(--accent)]" /><div><p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-[var(--muted-foreground)]">{n.message}</p></div></div>) : <p className="py-5 text-sm text-[var(--muted-foreground)]">No recent notifications.</p>}</div></Card></div>
  </>;
}
