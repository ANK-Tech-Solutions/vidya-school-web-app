"use client";
import { useEffect, useState } from "react";
import { Crosshair, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useDriverLocation } from "@/hooks/use-driver-location";
import { driverOpsService } from "@/services/driver-ops.service";
import { apiErrorMessage } from "@/lib/api-error";
import type { Trip } from "@/types/driver-ops";

type Action = "start" | "end" | "sos";
export default function DriverTripPage() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const location = useDriverLocation();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      driverOpsService
        .activeTrip()
        .then(setTrip)
        .catch(() => {
          setTrip(null);
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const execute = async () => {
    if (!confirming) return;
    setBusy(true);
    try {
      if (confirming === "start") {
        if (!location.enabled) {
          const enableError = await location.enable();
          if (enableError) {
            toast.error(enableError);
            return;
          }
        }
        setTrip(await driverOpsService.startTrip());
        toast.success("Trip started");
      } else if (confirming === "end") {
        await driverOpsService.endTrip();
        setTrip(null);
        toast.success("Trip ended");
      } else {
        await driverOpsService.sos();
        toast.success("SOS alert sent");
      }
      setConfirming(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Action could not be completed"));
    } finally {
      setBusy(false);
    }
  };
  const toggleLocation = async () => {
    const wasEnabled = location.enabled;
    if (wasEnabled) {
      await location.disable();
      toast.success("Location sharing disabled");
      return;
    }
    const enableError = await location.enable();
    if (enableError) toast.error(enableError);
    else toast.success("Location sharing enabled");
  };
  const fix = location.lastFix;
  return <><PageHeader eyebrow="Live operations" title="Trip control" description="Start your trip and keep live location sharing active." />
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><Card className="p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Current trip</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">{trip?.routeName ?? "No active route"}</p></div><Badge>{trip?.status ?? "Not started"}</Badge></div><div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => setConfirming(trip ? "end" : "start")} disabled={busy}>{trip ? "End trip" : "Start trip"}</Button><Button variant="outline" className="border-red-500/40 text-red-600 hover:bg-red-500/10" onClick={() => setConfirming("sos")} disabled={busy}><ShieldAlert size={17} />Send SOS</Button></div></Card>
      <Card className="p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Location sharing</h2><p className="mt-1 text-sm text-[var(--muted-foreground)]">{location.enabled ? "Sending location updates" : "Location updates are paused"}</p></div><Button size="sm" variant={location.enabled ? "outline" : "default"} onClick={() => void toggleLocation()}>{location.enabled ? "Disable" : "Enable"}</Button></div><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><LocationItem label="Latitude" value={fix?.latitude?.toFixed(6) ?? "—"} /><LocationItem label="Longitude" value={fix?.longitude?.toFixed(6) ?? "—"} /><LocationItem label="Accuracy" value={fix?.accuracy ? `${Math.round(fix.accuracy)} m` : "—"} /><LocationItem label="Speed" value={fix?.speed != null ? `${(fix.speed * 3.6).toFixed(1)} km/h` : "—"} /></div>{location.error && <p className="mt-4 text-sm text-red-600">{location.error}</p>}</Card></div>
    <Dialog open={Boolean(confirming)} onClose={() => setConfirming(null)} title={confirming === "sos" ? "Send SOS alert?" : confirming === "end" ? "End this trip?" : "Start this trip?"}><p className="text-sm text-[var(--muted-foreground)]">{confirming === "sos" ? "This will notify your school emergency contacts." : "Confirm this trip status change."}</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setConfirming(null)}>Cancel</Button><Button onClick={() => void execute()} disabled={busy} className={confirming === "sos" ? "bg-red-600 hover:bg-red-700" : ""}>{busy ? "Working…" : "Confirm"}</Button></div></Dialog></>;
}
function LocationItem({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[var(--muted)] p-3"><p className="text-xs text-[var(--muted-foreground)]">{label}</p><p className="mt-1 flex items-center gap-1 font-medium"><Crosshair size={13} className="text-[var(--primary)]" />{value}</p></div>; }
