"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { LiveMap } from "@/components/maps/live-map";
import { tripReplayService } from "@/services/trip-replay.service";
import type { InchargeTripRow, TripReplay } from "@/types/trip-replay";

export default function TripReplayPage() {
  const [trips, setTrips] = useState<InchargeTripRow[]>([]);
  const [tripId, setTripId] = useState<number | null>(null);
  const [replay, setReplay] = useState<TripReplay | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      tripReplayService
        .recentTrips({ size: 100 })
        .then((page) => {
          if (active) setTrips(page.content);
        })
        .catch(() => {
          if (active) toast.error("Could not load trips");
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const loadReplay = useCallback((id: number) => {
    setPlaying(false);
    setReplay(null);
    setIndex(0);
    tripReplayService
      .replay(id)
      .then((data) => {
        setReplay(data);
        setIndex(data.points.length ? data.points.length - 1 : 0);
      })
      .catch(() => toast.error("Could not load trip replay"));
  }, []);

  useEffect(() => {
    if (!playing || !replay || replay.points.length < 2) return;
    timer.current = setInterval(() => {
      setIndex((current) => {
        if (current >= replay.points.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 400);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, replay]);

  const path = useMemo<[number, number][]>(
    () => (replay?.points ?? []).slice(0, index + 1).map((p) => [Number(p.latitude), Number(p.longitude)]),
    [replay, index],
  );
  const current = replay?.points[index];

  return (
    <>
      <PageHeader
        eyebrow="Fleet history"
        title="Trip replay"
        description="Play back a completed trip's GPS breadcrumb trail along its route stops."
      />

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <Select
          value={tripId ?? ""}
          onChange={(event) => {
            const id = event.target.value ? Number(event.target.value) : null;
            setTripId(id);
            if (id) loadReplay(id);
          }}
          className="max-w-md"
        >
          <option value="">Select a trip…</option>
          {trips.map((trip) => (
            <option key={trip.tripId} value={trip.tripId}>
              #{trip.tripId} · Bus {trip.busNumber} · {trip.driverName}
              {trip.startedAt ? ` · ${new Date(trip.startedAt).toLocaleString()}` : ""}
            </option>
          ))}
        </Select>
      </Card>

      {!replay ? (
        <Card className="p-10 text-center text-sm text-[var(--muted-foreground)]">
          Select a trip above to replay its route.
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-3 lg:col-span-2">
            <LiveMap
              stops={replay.stops}
              pathPositions={path}
              busLat={current ? Number(current.latitude) : undefined}
              busLng={current ? Number(current.longitude) : undefined}
              busHeading={current?.heading ?? null}
              className="min-h-[420px]"
            />
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold">
              Bus {replay.busNumber} · {replay.routeName ?? "No route"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Driver {replay.driverName}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">Status</dt>
                <dd className="font-semibold">{replay.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">GPS points</dt>
                <dd className="font-semibold">{replay.points.length}</dd>
              </div>
              {current ? (
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">At</dt>
                  <dd className="font-semibold">{new Date(current.recordedAt).toLocaleTimeString()}</dd>
                </div>
              ) : null}
            </dl>

            {replay.points.length < 2 ? (
              <p className="mt-6 text-sm text-[var(--muted-foreground)]">
                No GPS breadcrumb was recorded for this trip.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                <input
                  type="range"
                  min={0}
                  max={replay.points.length - 1}
                  value={index}
                  onChange={(event) => {
                    setPlaying(false);
                    setIndex(Number(event.target.value));
                  }}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (index >= replay.points.length - 1) setIndex(0);
                      setPlaying((p) => !p);
                    }}
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                    {playing ? "Pause" : "Play"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPlaying(false);
                      setIndex(0);
                    }}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
