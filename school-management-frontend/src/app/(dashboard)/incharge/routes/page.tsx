"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { inchargeService } from "@/services/incharge.service";
import type { Route, RouteStop } from "@/types/route";

type StopValues = { name: string; address?: string; latitude?: number | string; longitude?: number | string };
type Values = {
  name: string;
  code: string;
  description?: string;
  distanceKm?: number | string;
  estimatedDurationMins?: number | string;
  stops: StopValues[];
};

function num(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function InchargeRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [open, setOpen] = useState(false);
  const [stopsOpen, setStopsOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [managing, setManaging] = useState<Route | null>(null);
  const [stopForm, setStopForm] = useState<RouteStop>({ name: "", latitude: undefined, longitude: undefined, address: "" });
  const [editingStopId, setEditingStopId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const form = useForm<Values>({ defaultValues: { name: "", code: "", stops: [{ name: "", latitude: "", longitude: "" }] } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "stops" });

  const load = () =>
    inchargeService
      .listRoutes()
      .then((x) => {
        setRoutes(x.content);
        if (managing) {
          const next = x.content.find((r) => r.id === managing.id) ?? null;
          setManaging(next);
        }
      })
      .catch(() => toast.error("Could not load routes"));

  useEffect(() => {
    load();
  }, []);

  const show = (route?: Route) => {
    setEditing(route ?? null);
    form.reset(
      route
        ? {
            name: route.name,
            code: route.code,
            description: route.description ?? "",
            distanceKm: route.distanceKm ?? "",
            estimatedDurationMins: route.estimatedDurationMins ?? "",
            stops: route.stops?.length
              ? route.stops.map((s) => ({
                  name: s.name,
                  address: s.address ?? "",
                  latitude: s.latitude ?? "",
                  longitude: s.longitude ?? "",
                }))
              : [{ name: "", latitude: "", longitude: "" }],
          }
        : { name: "", code: "", description: "", distanceKm: "", estimatedDurationMins: "", stops: [{ name: "", latitude: "", longitude: "" }] },
    );
    setOpen(true);
  };

  const openStops = (route: Route) => {
    setManaging(route);
    setEditingStopId(null);
    setStopForm({ name: "", latitude: undefined, longitude: undefined, address: "", stopOrder: (route.stops?.length ?? 0) + 1 });
    setStopsOpen(true);
  };

  const save = async (values: Values) => {
    const stops = (values.stops ?? [])
      .filter((s) => s.name?.trim())
      .map((s, index) => ({
        name: s.name.trim(),
        address: s.address?.trim() || undefined,
        stopOrder: index + 1,
        latitude: num(s.latitude) ?? 0,
        longitude: num(s.longitude) ?? 0,
      }));
    if (!stops.length) {
      toast.error("Add at least one stop with a name");
      return;
    }
    if (stops.some((s) => s.latitude === 0 && s.longitude === 0)) {
      toast.error("Each stop needs latitude and longitude");
      return;
    }
    const payload = {
      name: values.name.trim(),
      code: values.code.trim(),
      description: values.description?.trim() || undefined,
      distanceKm: num(values.distanceKm),
      estimatedDurationMins: num(values.estimatedDurationMins),
      stops,
    };
    try {
      if (editing) await inchargeService.updateRoute(editing.id, payload);
      else await inchargeService.createRoute(payload);
      toast.success("Route saved");
      setOpen(false);
      load();
    } catch {
      toast.error("Could not save route");
    }
  };

  const saveStop = async () => {
    if (!managing) return;
    if (!stopForm.name?.trim()) {
      toast.error("Stop name is required");
      return;
    }
    const latitude = num(stopForm.latitude);
    const longitude = num(stopForm.longitude);
    if (latitude == null || longitude == null) {
      toast.error("Latitude and longitude are required");
      return;
    }
    setBusy(true);
    const payload = {
      name: stopForm.name.trim(),
      address: stopForm.address?.trim() || undefined,
      latitude,
      longitude,
      stopOrder: stopForm.stopOrder ?? undefined,
    };
    try {
      if (editingStopId != null) await inchargeService.updateStop(managing.id, editingStopId, payload);
      else await inchargeService.addStop(managing.id, payload);
      toast.success(editingStopId != null ? "Stop updated" : "Stop added");
      setEditingStopId(null);
      setStopForm({ name: "", latitude: undefined, longitude: undefined, address: "" });
      load();
    } catch {
      toast.error("Could not save stop");
    } finally {
      setBusy(false);
    }
  };

  const editStop = (stop: RouteStop) => {
    setEditingStopId(stop.id ?? null);
    setStopForm({
      name: stop.name,
      address: stop.address ?? "",
      latitude: stop.latitude,
      longitude: stop.longitude,
      stopOrder: stop.stopOrder,
    });
  };

  const removeStop = async (stop: RouteStop) => {
    if (!managing || stop.id == null) return;
    if (!window.confirm(`Delete stop “${stop.name}”?`)) return;
    setBusy(true);
    try {
      await inchargeService.deleteStop(managing.id, stop.id);
      toast.success("Stop deleted");
      if (editingStopId === stop.id) {
        setEditingStopId(null);
        setStopForm({ name: "", latitude: undefined, longitude: undefined, address: "" });
      }
      load();
    } catch {
      toast.error("Could not delete stop");
    } finally {
      setBusy(false);
    }
  };

  const sortedStops = [...(managing?.stops ?? [])].sort((a, b) => (a.stopOrder ?? 0) - (b.stopOrder ?? 0));

  return (
    <>
      <PageHeader
        eyebrow="Network"
        title="Routes"
        description="Create routes, then update or delete individual stops anytime."
        action={
          <Button onClick={() => show()}>
            <Plus size={17} />
            Add route
          </Button>
        }
      />
      <DataTable title={`${routes.length} routes`}>
        <div className="divide-y">
          {routes.map((route) => (
            <div key={route.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">
                  {route.name} <span className="text-sm font-normal text-[var(--muted-foreground)]">· {route.code}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {route.stops?.length ?? 0} stops · {route.distanceKm ?? "—"} km · {route.estimatedDurationMins ?? "—"} mins
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openStops(route)}>
                  <MapPin size={15} />
                  Manage stops
                </Button>
                <Button size="sm" variant="outline" onClick={() => show(route)}>
                  Edit route
                </Button>
              </div>
            </div>
          ))}
        </div>
        {!routes.length && <EmptyState title="No routes yet" action={{ label: "Add route", onClick: () => show() }} />}
      </DataTable>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit route" : "Add route"}>
        <form onSubmit={form.handleSubmit(save)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input className="mt-1" {...form.register("name", { required: true })} />
            </div>
            <div>
              <Label>Code</Label>
              <Input className="mt-1" {...form.register("code", { required: true })} />
            </div>
            <div>
              <Label>Distance (km)</Label>
              <Input className="mt-1" type="number" step="0.1" {...form.register("distanceKm")} />
            </div>
            <div>
              <Label>Duration (mins)</Label>
              <Input className="mt-1" type="number" {...form.register("estimatedDurationMins")} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input className="mt-1" {...form.register("description")} />
          </div>
          {!editing && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Initial stops</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => append({ name: "", latitude: "", longitude: "" })}>
                  <Plus size={15} />
                  Stop
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="mb-3 space-y-2 rounded-xl border border-[var(--border)] p-3">
                  <div className="flex gap-2">
                    <Input placeholder={`Stop ${index + 1} name`} {...form.register(`stops.${index}.name`)} />
                    <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} aria-label="Remove stop">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <Input placeholder="Address" {...form.register(`stops.${index}.address`)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Latitude" type="number" step="any" {...form.register(`stops.${index}.latitude`)} />
                    <Input placeholder="Longitude" type="number" step="any" {...form.register(`stops.${index}.longitude`)} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {editing && <p className="text-sm text-[var(--muted-foreground)]">Use Manage stops to update or delete individual stops without rewriting the whole route.</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save route</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={stopsOpen} onClose={() => setStopsOpen(false)} title={managing ? `Stops · ${managing.name}` : "Stops"}>
        <div className="space-y-4">
          <Card className="space-y-3 border-0 bg-[var(--muted)] p-4 shadow-none">
            <p className="text-sm font-semibold">{editingStopId != null ? "Update stop" : "Add stop"}</p>
            <Input placeholder="Stop name" value={stopForm.name} onChange={(e) => setStopForm((s) => ({ ...s, name: e.target.value }))} />
            <Input placeholder="Address" value={stopForm.address ?? ""} onChange={(e) => setStopForm((s) => ({ ...s, address: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Latitude"
                type="number"
                step="any"
                value={stopForm.latitude ?? ""}
                onChange={(e) => setStopForm((s) => ({ ...s, latitude: e.target.value === "" ? undefined : Number(e.target.value) }))}
              />
              <Input
                placeholder="Longitude"
                type="number"
                step="any"
                value={stopForm.longitude ?? ""}
                onChange={(e) => setStopForm((s) => ({ ...s, longitude: e.target.value === "" ? undefined : Number(e.target.value) }))}
              />
            </div>
            <Input
              placeholder="Order"
              type="number"
              value={stopForm.stopOrder ?? ""}
              onChange={(e) => setStopForm((s) => ({ ...s, stopOrder: e.target.value === "" ? undefined : Number(e.target.value) }))}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => void saveStop()} disabled={busy}>
                {busy ? "Saving…" : editingStopId != null ? "Update stop" : "Add stop"}
              </Button>
              {editingStopId != null && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingStopId(null);
                    setStopForm({ name: "", latitude: undefined, longitude: undefined, address: "" });
                  }}
                >
                  Cancel edit
                </Button>
              )}
            </div>
          </Card>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {sortedStops.map((stop, index) => (
              <div key={stop.id ?? index} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] p-3">
                <div>
                  <p className="font-semibold">
                    {index + 1}. {stop.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {stop.address || "No address"}
                    {stop.latitude != null && stop.longitude != null ? ` · ${Number(stop.latitude).toFixed(5)}, ${Number(stop.longitude).toFixed(5)}` : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label="Edit stop" onClick={() => editStop(stop)}>
                    <Pencil size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete stop" onClick={() => void removeStop(stop)}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {!sortedStops.length && <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">No stops on this route yet.</p>}
          </div>
        </div>
      </Dialog>
    </>
  );
}
