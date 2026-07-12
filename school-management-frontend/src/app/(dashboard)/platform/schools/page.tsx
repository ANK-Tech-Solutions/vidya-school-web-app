"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  platformService,
  type PlatformSchool,
  type PlatformSchoolPayload,
} from "@/services/platform.service";

const blank: PlatformSchoolPayload = {
  code: "",
  name: "",
  appName: "",
  address: "",
  city: "",
  state: "",
  phone: "",
  email: "",
  active: true,
};

export default function PlatformSchoolsPage() {
  const [schools, setSchools] = useState<PlatformSchool[]>([]);
  const [form, setForm] = useState<PlatformSchoolPayload>(blank);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    platformService
      .listSchools()
      .then((page) => setSchools(page.content))
      .catch(() => toast.error("Could not load schools"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(blank);
    setEditingId(null);
    setOpen(false);
  };

  const startEdit = (school: PlatformSchool) => {
    setEditingId(school.id);
    setForm({
      code: school.code,
      name: school.name,
      appName: school.appName ?? "",
      address: school.address ?? "",
      city: school.city ?? "",
      state: school.state ?? "",
      phone: school.phone ?? "",
      email: school.email ?? "",
      active: school.active,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId != null) {
        await platformService.updateSchool(editingId, form);
        toast.success("School updated");
      } else {
        await platformService.createSchool(form);
        toast.success("School created");
      }
      resetForm();
      load();
    } catch {
      toast.error(editingId != null ? "Could not update school" : "Could not create school");
    }
  };

  const deactivate = async (id: number) => {
    try {
      await platformService.deactivateSchool(id);
      toast.success("School deactivated");
      load();
    } catch {
      toast.error("Could not deactivate school");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Schools"
        description="Create and manage tenant schools on the platform."
      />
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(blank);
            setOpen(!open);
          }}
        >
          {open && editingId == null ? "Cancel" : "Add school"}
        </Button>
      </div>

      {open && (
        <Card className="mb-6 p-5">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">School code</Label>
              <Input
                id="code"
                required
                placeholder="e.g. DPS-NOIDA"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">School name</Label>
              <Input
                id="name"
                required
                placeholder="Full school name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appName">App display name</Label>
              <Input
                id="appName"
                placeholder="Optional branding name"
                value={form.appName ?? ""}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="school@example.com"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91…"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city ?? ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address ?? ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state ?? ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-3">
              <Button type="submit">{editingId != null ? "Update school" : "Create school"}</Button>
              {editingId != null && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="divide-y">
          {loading ? (
            <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">Loading schools…</p>
          ) : schools.length ? (
            schools.map((school) => (
              <div key={school.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {school.name}{" "}
                    <span className="text-xs font-semibold text-[var(--primary)]">{school.code}</span>
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {[school.city, school.state].filter(Boolean).join(", ") || "No location"}
                    {school.email ? ` · ${school.email}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                      school.active ? "bg-teal-500/12 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {school.active ? "Active" : "Inactive"}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(school)}>
                    Edit
                  </Button>
                  {school.active && (
                    <Button type="button" variant="outline" size="sm" onClick={() => deactivate(school.id)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">No schools yet. Create the first one.</p>
          )}
        </div>
      </Card>
    </>
  );
}
