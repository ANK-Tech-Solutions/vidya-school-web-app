"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { StudentSelector } from "@/components/student/student-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { studentOpsService } from "@/services/student-ops.service";
import type { StudentNotification } from "@/types/student-ops";

export default function StudentNotificationsPage() {
  const [studentId, setStudentId] = useState<number | undefined>();
  const [items, setItems] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);
  const selectStudent = useCallback((id?: number) => setStudentId(id), []);
  useEffect(() => { studentOpsService.getNotifications(studentId).then(setItems).catch(() => toast.error("Could not load notifications")).finally(() => setLoading(false)); }, [studentId]);
  const markRead = async (id: number) => {
    setMarking(id);
    try {
      await studentOpsService.markNotificationRead(id);
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch { toast.error("Could not mark notification as read"); } finally { setMarking(null); }
  };
  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader eyebrow="Updates" title="Notifications" description="Transport updates and important journey alerts." /><StudentSelector onChange={selectStudent} /></div>
    <Card className="divide-y divide-[var(--border)]">{loading ? <div className="space-y-4 p-5">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div> : items.length ? items.map((item) => <div key={item.id} className={`flex gap-4 p-5 ${item.read ? "" : "bg-teal-500/5"}`}><span className="h-fit rounded-xl bg-amber-400/15 p-3 text-[var(--accent-foreground)]"><Bell size={18} /></span><div className="min-w-0 flex-1"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.message}</p><p className="mt-2 text-xs text-[var(--muted-foreground)]">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recent"}</p></div>{!item.read && <Button size="sm" variant="outline" disabled={marking === item.id} onClick={() => void markRead(item.id)}>Mark read</Button>}</div>) : <EmptyState title="You are all caught up" description="New transport activity will appear here." />}</Card>
  </>;
}
