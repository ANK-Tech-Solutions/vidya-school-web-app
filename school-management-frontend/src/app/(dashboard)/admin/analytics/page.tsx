"use client";

import { useEffect, useState } from "react";
import { Bus, GraduationCap, Timer, TrendingUp, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Card } from "@/components/ui/card";
import { analyticsService } from "@/services/analytics.service";
import type { AnalyticsOverview } from "@/types/analytics";

const money = (value: number) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      analyticsService
        .overview()
        .then((overview) => {
          if (active) setData(overview);
        })
        .catch(() => {
          if (active) toast.error("Could not load analytics");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const maxDay = Math.max(1, ...(data?.attendanceTrend ?? []).map((d) => d.present + d.absent));

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="School analytics"
        description="Fleet utilisation, punctuality, attendance trends, fees, and academic performance at a glance."
      />

      {loading || !data ? (
        <Card className="p-8 text-sm text-[var(--muted-foreground)]">Loading analytics…</Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students" value={data.totalStudents} icon={GraduationCap} />
            <StatCard label="Teachers" value={data.totalTeachers} icon={Users} />
            <StatCard label="Active buses" value={data.activeBuses} icon={Bus} />
            <StatCard label="Drivers online" value={data.driversOnline} icon={Users} />
            <StatCard label="On-time trips (30d)" value={`${data.onTimePercent}%`} icon={Timer} />
            <StatCard label="Trips completed (30d)" value={`${data.tripsCompleted}/${data.tripsTotal}`} icon={TrendingUp} />
            <StatCard label="Students transported (30d)" value={data.studentsTransported} icon={Bus} />
            <StatCard label="Exam average" value={`${data.examAveragePercent}%`} icon={TrendingUp} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <h2 className="font-display text-lg font-bold">Class attendance — last 7 days</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Present/late (teal) vs absent (amber).</p>
              <div className="mt-6 flex items-end gap-3">
                {data.attendanceTrend.map((day) => {
                  const total = day.present + day.absent;
                  const height = Math.round((total / maxDay) * 140);
                  const presentH = total ? Math.round((day.present / total) * height) : 0;
                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-[140px] w-full items-end justify-center" title={`${day.present} present · ${day.absent} absent`}>
                        <div className="flex w-8 flex-col justify-end overflow-hidden rounded-lg" style={{ height: `${Math.max(height, 4)}px` }}>
                          <div className="w-full bg-amber-400" style={{ height: `${height - presentH}px` }} />
                          <div className="w-full bg-[var(--primary)]" style={{ height: `${presentH}px` }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)]">{day.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-lg font-bold">Fees</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Invoiced</span>
                  <span className="font-semibold">{money(data.feesInvoiced)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Collected</span>
                  <span className="font-semibold text-[var(--primary)]">{money(data.feesCollected)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Outstanding</span>
                  <span className="font-semibold text-amber-600">{money(data.feesOutstanding)}</span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${data.feesInvoiced ? Math.min(100, Math.round((data.feesCollected / data.feesInvoiced) * 100)) : 0}%`,
                    }}
                  />
                </div>
                <p className="flex items-center gap-2 pt-2 text-xs text-[var(--muted-foreground)]">
                  <Wallet size={14} />
                  {data.feesInvoiced ? Math.round((data.feesCollected / data.feesInvoiced) * 100) : 0}% collected
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
