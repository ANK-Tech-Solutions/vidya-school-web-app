"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { driverOpsService } from "@/services/driver-ops.service";
import type { AssignedRoute } from "@/types/driver-ops";

export default function DriverRoutePage() {
  const [route, setRoute] = useState<AssignedRoute | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const load = () =>
    driverOpsService
      .getRoute()
      .then((data) => setRoute(data))
      .catch(() => {
        setRoute(null);
        toast.error("Could not load your route");
      });

  useEffect(() => {
    void load();
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        toast.success("Current location captured");
      },
      () => toast.error("Could not read your current location"),
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const addStop = async () => {
    if (!name.trim()) {
      toast.error("Enter a stop name");
      return;
    }
    if (!coords) {
      toast.error("Capture your current location first");
      return;
    }
    setBusy(true);
    try {
      await driverOpsService.addStop({
        name: name.trim(),
        address: address.trim() || undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setName("");
      setAddress("");
      toast.success("Stop added to your route");
      await load();
    } catch {
      toast.error("Could not add this stop");
    } finally {
      setBusy(false);
    }
  };

  const stops = [...(route?.stops ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <PageHeader
        eyebrow="Assigned route"
        title={route?.name ?? "My route"}
        description={route?.description ?? "Review stops and add new ones from your current GPS location."}
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">{route?.code ?? "Route pending"}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {route?.distanceKm ?? "—"} km · {route?.estimatedDurationMins ?? "—"} min
              </p>
            </div>
            <Badge>{stops.length} stops</Badge>
          </div>
          <div className="mt-7 space-y-0">
            {stops.map((stop, index) => (
              <div key={stop.id ?? `${stop.name}-${index}`} className="relative flex gap-4 pb-7 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  {index < stops.length - 1 && <span className="mt-1 h-full w-px bg-[var(--border)]" />}
                </div>
                <div className="pt-1">
                  <p className="font-semibold">{stop.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {stop.address ?? "Address not provided"}
                    {stop.latitude != null && stop.longitude != null
                      ? ` · ${Number(stop.latitude).toFixed(5)}, ${Number(stop.longitude).toFixed(5)}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {!stops.length && (
            <div className="flex min-h-48 flex-col items-center justify-center text-center text-[var(--muted-foreground)]">
              <MapPin size={28} />
              <p className="mt-3">No stops have been assigned yet.</p>
            </div>
          )}
        </Card>

        <Card className="h-fit p-6">
          <h2 className="font-display text-xl font-bold">Add stop from location</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Capture GPS where you are standing, then save it as the next stop on this route.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="stop-name">Stop name</Label>
              <Input id="stop-name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lake View Apartments" />
            </div>
            <div>
              <Label htmlFor="stop-address">Address (optional)</Label>
              <Input id="stop-address" className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Landmark or street" />
            </div>
            <div className="rounded-xl bg-[var(--muted)] p-3 text-sm">
              {coords ? (
                <p>
                  Lat {coords.latitude.toFixed(6)}, Lng {coords.longitude.toFixed(6)}
                </p>
              ) : (
                <p className="text-[var(--muted-foreground)]">No location captured yet</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={captureLocation}>
                <MapPin size={16} /> Use current location
              </Button>
              <Button type="button" onClick={() => void addStop()} disabled={busy}>
                <Plus size={16} /> {busy ? "Saving…" : "Add stop"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
