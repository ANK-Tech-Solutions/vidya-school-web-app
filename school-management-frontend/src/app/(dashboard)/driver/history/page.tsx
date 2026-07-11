"use client";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { driverOpsService } from "@/services/driver-ops.service";
import type { PageResponse } from "@/types/common";
import type { Trip } from "@/types/driver-ops";

const pageSize = 10;
export default function DriverHistoryPage() {
  const [history, setHistory] = useState<PageResponse<Trip> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => { setLoading(true); driverOpsService.tripHistory({ page, size: pageSize }).then(setHistory).catch(() => toast.error("Could not load trip history")).finally(() => setLoading(false)); }, 0); return () => window.clearTimeout(timer); }, [page]);
  return <><PageHeader eyebrow="Past journeys" title="Trip history" description="Review your recently completed routes." />
    <Card className="overflow-hidden"><div className="divide-y divide-[var(--border)]">{history?.content.map((trip, index) => <div key={trip.id ?? index} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-semibold">{trip.routeName ?? "School route"}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{trip.startedAt ? new Date(trip.startedAt).toLocaleString() : "Date unavailable"}{trip.busNumber ? ` · ${trip.busNumber}` : ""}</p></div><div className="text-right text-sm"><p className="font-semibold">{trip.distanceKm ?? "—"} km</p><p className="mt-1 text-[var(--muted-foreground)]">{trip.studentCount ?? 0} students</p></div></div>)}</div>
      {!loading && !history?.content.length && <div className="flex min-h-52 flex-col items-center justify-center text-[var(--muted-foreground)]"><History size={28} /><p className="mt-3 text-sm">No completed trips yet.</p></div>}
      <div className="flex items-center justify-between border-t border-[var(--border)] p-4"><p className="text-sm text-[var(--muted-foreground)]">Page {page + 1} of {history?.totalPages || 1}</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPage((value) => value - 1)} disabled={page === 0 || loading}>Previous</Button><Button size="sm" variant="outline" onClick={() => setPage((value) => value + 1)} disabled={Boolean(history?.last) || loading}>Next</Button></div></div></Card></>;
}
