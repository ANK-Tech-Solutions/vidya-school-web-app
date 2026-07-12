"use client";

import { Bus, CircleDot, Flag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RouteTrackStop } from "@/types/student-ops";

export type RouteTrackProps = {
  routeName?: string | null;
  busNumber?: string | null;
  tripStatus?: string | null;
  stops: RouteTrackStop[];
  currentStopId?: number | null;
  nextStopId?: number | null;
  studentStopId?: number | null;
  studentStopName?: string | null;
  eta?: string | null;
  className?: string;
};

function stopState(
  stop: RouteTrackStop,
  currentStopId?: number | null,
  nextStopId?: number | null,
  studentStopId?: number | null,
  currentOrder?: number | null,
): "passed" | "current" | "next" | "yours" | "upcoming" {
  if (currentStopId != null && stop.id === currentStopId) return "current";
  if (nextStopId != null && stop.id === nextStopId) return "next";
  if (studentStopId != null && stop.id === studentStopId) return "yours";
  if (currentOrder != null && stop.stopOrder != null && stop.stopOrder < currentOrder) return "passed";
  return "upcoming";
}

const styles = {
  passed: "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
  current: "border-teal-500/40 bg-teal-500/10 text-[var(--foreground)]",
  next: "border-amber-500/40 bg-amber-500/10 text-[var(--foreground)]",
  yours: "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]",
  upcoming: "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)]",
} as const;

const labels = {
  passed: "Passed",
  current: "Bus here",
  next: "Next stop",
  yours: "Your stop",
  upcoming: "Upcoming",
} as const;

export function RouteTrackPanel({
  routeName,
  busNumber,
  tripStatus,
  stops,
  currentStopId,
  nextStopId,
  studentStopId,
  studentStopName,
  eta,
  className,
}: RouteTrackProps) {
  const ordered = [...stops].sort((a, b) => (a.stopOrder ?? 0) - (b.stopOrder ?? 0));
  const current = ordered.find((s) => s.id === currentStopId);
  const currentOrder = current?.stopOrder ?? null;
  const status = tripStatus?.replaceAll("_", " ") ?? "No active trip";

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Route track</p>
          <h2 className="mt-1 font-display text-xl font-bold">{routeName ?? "Assigned route"}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {busNumber ? `Bus ${busNumber}` : "Bus pending"} · {status}
          </p>
        </div>
        <div className="rounded-xl bg-[var(--muted)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--muted-foreground)]">ETA to your stop</p>
          <p className="font-display text-lg font-bold">{eta ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="default">
          <Bus size={12} className="mr-1" />
          {status}
        </Badge>
        {(studentStopName || studentStopId) && (
          <Badge variant="slate">
            <Flag size={12} className="mr-1" />
            Your stop: {studentStopName ?? "Assigned stop"}
          </Badge>
        )}
      </div>

      <ol className="mt-6 space-y-3">
        {ordered.length ? (
          ordered.map((stop, index) => {
            const state = stopState(stop, currentStopId, nextStopId, studentStopId, currentOrder);
            const isYours = studentStopId != null && stop.id === studentStopId;
            return (
              <li key={stop.id ?? `${stop.name}-${index}`} className={cn("rounded-2xl border p-4", styles[state])}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-sm font-bold">
                      {stop.stopOrder ?? index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {stop.name}
                        {isYours ? " · You" : ""}
                      </p>
                      {stop.address && (
                        <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{stop.address}</p>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
                    {state === "current" ? <Bus size={14} /> : state === "yours" ? <Flag size={14} /> : state === "next" ? <CircleDot size={14} /> : <MapPin size={14} />}
                    {labels[state]}
                    {isYours && eta && state !== "passed" ? ` · ${eta}` : ""}
                  </span>
                </div>
              </li>
            );
          })
        ) : (
          <li className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
            No stops on this route yet.
          </li>
        )}
      </ol>
    </Card>
  );
}
