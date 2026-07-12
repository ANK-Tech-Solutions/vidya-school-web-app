"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  vehicleInchargeService,
  type VehicleIncharge,
  type VehicleInchargePayload,
} from "@/services/vehicle-incharge.service";

const blank: VehicleInchargePayload = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
};

export default function AdminVehicleInchargesPage() {
  const [rows, setRows] = useState<VehicleIncharge[]>([]);
  const [form, setForm] = useState<VehicleInchargePayload>(blank);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    vehicleInchargeService
      .list()
      .then((page) => setRows(page.content))
      .catch(() => toast.error("Could not load vehicle incharges"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleInchargeService.create({
        ...form,
        password: form.password?.trim() ? form.password : undefined,
      });
      toast.success("Vehicle incharge created");
      setForm(blank);
      setOpen(false);
      load();
    } catch {
      toast.error("Could not create vehicle incharge");
    }
  };

  const deactivate = async (id: number) => {
    try {
      await vehicleInchargeService.deactivate(id);
      toast.success("Vehicle incharge deactivated");
      load();
    } catch {
      toast.error("Could not deactivate vehicle incharge");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Vehicle incharges"
        description="Assign fleet managers for your school. They sign in at the /incharge portal."
      />
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setOpen(!open)}>{open ? "Cancel" : "Add vehicle incharge"}</Button>
      </div>

      {open && (
        <Card className="mb-6 p-5">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Defaults to Password@123"
                value={form.password ?? ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create vehicle incharge</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="divide-y">
          {loading ? (
            <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">Loading vehicle incharges…</p>
          ) : rows.length ? (
            rows.map((row) => (
              <div key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {row.firstName} {row.lastName}{" "}
                    <span className="text-xs font-semibold text-[var(--primary)]">@{row.username}</span>
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">{row.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                      row.active ? "bg-teal-500/12 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {row.active ? "Active" : "Inactive"}
                  </span>
                  {row.active && (
                    <Button type="button" variant="outline" size="sm" onClick={() => deactivate(row.id)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">No vehicle incharges yet.</p>
          )}
        </div>
      </Card>
    </>
  );
}
