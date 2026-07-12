"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { staffService, type StaffDashboard } from "@/services/staff.service";

export default function StaffDashboardPage() {
  const [data, setData] = useState<StaffDashboard | null>(null);
  useEffect(() => {
    staffService.dashboard().then(setData).catch(() => toast.error("Could not load staff dashboard"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Staff portal" title="School workplace" description="Optional staff access for notices and calendar. More worker tools can be added later." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Active notices</p>
          <p className="mt-2 font-display text-3xl font-bold">{data?.notices ?? "—"}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--muted-foreground)]">Calendar events</p>
          <p className="mt-2 font-display text-3xl font-bold">{data?.events ?? "—"}</p>
        </Card>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">{data?.message}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/staff/notices" className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-5 font-semibold hover:bg-[var(--muted)]">
          <Megaphone className="text-[var(--primary)]" size={18} />
          Notice board
        </Link>
        <Link href="/staff/calendar" className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-5 font-semibold hover:bg-[var(--muted)]">
          <CalendarDays className="text-[var(--primary)]" size={18} />
          Calendar
        </Link>
      </div>
    </>
  );
}
