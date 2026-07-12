"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, GraduationCap, School, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/admin/stat-card";
import { adminDashboardService } from "@/services/admin-dashboard.service";
import { notificationService } from "@/services/notification.service";
import type { DashboardStats } from "@/types/dashboard";
import type { Notification } from "@/types/notification";

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    Promise.all([adminDashboardService.getStats(), notificationService.list({ size: 4 })])
      .then(([s, n]) => {
        setStats(s);
        setNotifications(n.content);
      })
      .catch(() => undefined);
  }, []);

  const cards = [
    { label: "Students", value: stats?.totalStudents, icon: GraduationCap },
    { label: "Parents", value: stats?.totalParents, icon: UsersRound },
    { label: "School notices", value: notifications.length, icon: Bell },
    { label: "Academics", value: stats?.totalStudents, icon: School },
  ];

  return (
    <>
      <PageHeader
        eyebrow="School administration"
        title="Good morning, administrator."
        description="Manage people, academics, and school communications. Fleet operations are handled by Vehicle Incharge."
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) =>
          stats ? (
            <StatCard key={card.label} {...card} value={card.value ?? 0} />
          ) : (
            <Card key={card.label} className="p-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="mt-6 h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </Card>
          ),
        )}
      </motion.div>
      <Card className="mt-6 p-6">
        <h2 className="font-display text-xl font-bold">Fleet note</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Buses, drivers, routes, assignments, live tracking, and transport reports are owned by the{" "}
          <strong>Vehicle Incharge</strong> portal. Drivers run trips from the <strong>Driver</strong> portal.
        </p>
      </Card>
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Recent updates</h2>
          <Link href="/admin/notifications" className="text-sm font-semibold text-[var(--primary)]">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {notifications.length ? (
            notifications.map((n) => (
              <div key={n.id} className="flex gap-3">
                <Bell size={17} className="mt-0.5 text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{n.message}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-5 text-sm text-[var(--muted-foreground)]">No recent notifications.</p>
          )}
        </div>
      </Card>
    </>
  );
}
