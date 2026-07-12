"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routeService } from "@/services/route.service";
import type { Route } from "@/types/route";

type StopValues = {
  name: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
};

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

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const form = useForm<Values>({ defaultValues: { name: "", code: "", stops: [{ name: "", latitude: "", longitude: "" }] } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "stops" });

  const load = () =>
    routeService
      .list({ size: 100 })
      .then((x) => setRoutes(x.content))
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
      if (editing) await routeService.update(editing.id, payload);
      else await routeService.create(payload);
      toast.success("Route saved");
      setOpen(false);
      load();
    } catch {
      toast.error("Could not save route");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Network"
        title="Routes"
        description="Design the stops and travel estimates for every school route."
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
            <div key={route.id} className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">
                  {route.name} <span className="text-sm font-normal text-[var(--muted-foreground)]">· {route.code}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {route.stops?.length ?? 0} stops · {route.distanceKm ?? "—"} km · {route.estimatedDurationMins ?? "—"} mins
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => show(route)}>
                Edit
              </Button>
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
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Stops</Label>
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
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save route</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
