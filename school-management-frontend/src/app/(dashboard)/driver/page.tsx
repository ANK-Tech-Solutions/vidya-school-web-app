"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, MapPinned, Navigation, Plus, Radio, ShieldAlert, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { driverOpsService } from "@/services/driver-ops.service";
import { useDriverLocation } from "@/hooks/use-driver-location";
import { apiErrorMessage } from "@/lib/api-error";
import type { DriverDashboard, Trip } from "@/types/driver-ops";

export default function DriverPage() {
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [busy, setBusy] = useState(false);
  const location = useDriverLocation();
  const load = async () => {
    try {
      const data = await driverOpsService.getDashboard();
      setDashboard(data);
      setTrip(data.activeTrip ?? null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not load your driver dashboard"));
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const run = async (action: "start" | "end" | "sos") => {
    setBusy(true);
    try {
      if (action === "start") {
        if (!location.enabled) {
          const enableError = await location.enable();
          if (enableError) {
            toast.error(enableError);
            return;
          }
        }
        const next = await driverOpsService.startTrip();
        setTrip(next);
        toast.success("Trip started");
      } else if (action === "end") {
        await driverOpsService.endTrip();
        setTrip(null);
        toast.success("Trip ended");
      } else {
        await driverOpsService.sos();
        toast.success("SOS alert sent");
      }
      await load();
    } catch (error) {
      toast.error(apiErrorMessage(error, `Could not ${action === "sos" ? "send SOS" : `${action} trip`}`));
    } finally {
      setBusy(false);
    }
  };
  const toggleLocation = async () => {
    const wasEnabled = location.enabled;
    if (wasEnabled) {
      await location.disable();
      toast.success("Location sharing disabled");
      await load();
      return;
    }
    const enableError = await location.enable();
    if (enableError) toast.error(enableError);
    else {
      toast.success("Location sharing enabled");
      await load();
    }
  };
  const statuses = [
    { label: "Online", value: dashboard?.online ? "Online" : "Offline", ok: Boolean(dashboard?.online), icon: Wifi },
    { label: "GPS", value: location.gpsOk ? "Connected" : location.enabled ? "Searching" : "Off", ok: location.gpsOk, icon: Radio },
    { label: "Internet", value: location.online ? "Connected" : "Offline", ok: location.online, icon: Gauge },
    { label: "Trip", value: trip ? trip.status ?? "Active" : "Not started", ok: Boolean(trip), icon: Navigation },
  ];
  return (
    <>
      <PageHeader eyebrow="Driver workspace" title="Ready for the road." description="Keep your location, route, and student pickups in sync." />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statuses.map(({ label, value, ok, icon: Icon }) => (
          <Card key={label} className="p-5">
            <Icon size={20} className={ok ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} />
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">{label}</p>
            <p className="mt-1 font-bold">{value}</p>
          </Card>
        ))}
      </motion.div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Badge>{trip ? "Trip in progress" : "Awaiting departure"}</Badge>
          <h2 className="mt-4 font-display text-2xl font-bold">
            {dashboard?.assignedBus?.busNumber ?? dashboard?.assignedBus?.registrationNumber ?? "No bus assigned"}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {dashboard?.assignedRoute?.name ?? "No route assigned"}
            {dashboard?.todayStudents ? ` · ${dashboard.todayStudents} students today` : ""}
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
            <MapPinned size={17} /> {dashboard?.assignedRoute?.stops?.length ?? 0} scheduled stops
          </div>
          <Link
            href="/driver/route"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Add stop from GPS
          </Link>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold">Quick actions</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Control your shift from one place.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant={location.enabled ? "outline" : "default"} onClick={() => void toggleLocation()} disabled={busy}>
              {location.enabled ? "Disable location" : "Enable location"}
            </Button>
            <Button variant="amber" onClick={() => void run(trip ? "end" : "start")} disabled={busy}>
              {trip ? "End trip" : "Start trip"}
            </Button>
            <Button variant="outline" className="border-red-500/40 text-red-600 hover:bg-red-500/10" onClick={() => void run("sos")} disabled={busy}>
              <ShieldAlert size={17} />
              SOS
            </Button>
          </div>
          {location.error && <p className="mt-4 text-sm text-red-600">{location.error}</p>}
          {location.enabled && (
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Location stays on while you switch screens or minimize the app. Tap Disable location to stop sharing.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
