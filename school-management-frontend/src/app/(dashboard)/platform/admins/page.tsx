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
  type PlatformAdmin,
  type PlatformAdminPayload,
  type PlatformSchool,
} from "@/services/platform.service";

const blank: PlatformAdminPayload = {
  schoolId: 0,
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
};

export default function PlatformAdminsPage() {
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [schools, setSchools] = useState<PlatformSchool[]>([]);
  const [form, setForm] = useState<PlatformAdminPayload>(blank);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([platformService.listAdmins(), platformService.listSchools()])
      .then(([adminPage, schoolPage]) => {
        setAdmins(adminPage.content);
        setSchools(schoolPage.content.filter((s) => s.active));
      })
      .catch(() => toast.error("Could not load school admins"))
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
    if (!form.schoolId) {
      toast.error("Select a school");
      return;
    }
    try {
      await platformService.createAdmin({
        ...form,
        password: form.password?.trim() ? form.password : undefined,
      });
      toast.success("School admin created");
      setForm(blank);
      setOpen(false);
      load();
    } catch {
      toast.error("Could not create school admin");
    }
  };

  const deactivate = async (id: number) => {
    try {
      await platformService.deactivateAdmin(id);
      toast.success("School admin deactivated");
      load();
    } catch {
      toast.error("Could not deactivate admin");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="School admins"
        description="Provision ADMIN accounts for each school. They sign in at the school admin portal."
      />
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setOpen(!open)}>{open ? "Cancel" : "Add school admin"}</Button>
      </div>

      {open && (
        <Card className="mb-6 p-5">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="schoolId">School</Label>
              <select
                id="schoolId"
                required
                className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                value={form.schoolId || ""}
                onChange={(e) => setForm({ ...form, schoolId: Number(e.target.value) })}
              >
                <option value="">Select school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
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
              <Button type="submit">Create school admin</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="divide-y">
          {loading ? (
            <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">Loading admins…</p>
          ) : admins.length ? (
            admins.map((admin) => (
              <div key={admin.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {admin.firstName} {admin.lastName}{" "}
                    <span className="text-xs font-semibold text-[var(--primary)]">@{admin.username}</span>
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {admin.schoolName ?? "School"} ({admin.schoolCode ?? "—"}) · {admin.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                      admin.active ? "bg-teal-500/12 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {admin.active ? "Active" : "Inactive"}
                  </span>
                  {admin.active && (
                    <Button type="button" variant="outline" size="sm" onClick={() => deactivate(admin.id)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-10 text-center text-sm text-[var(--muted-foreground)]">
              No school admins yet. Create a school first, then add an admin.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
