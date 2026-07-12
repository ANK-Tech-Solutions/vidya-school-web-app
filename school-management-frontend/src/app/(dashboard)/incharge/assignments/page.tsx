"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { Assignment } from "@/types/assignment";
import type { Bus } from "@/types/bus";
import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { Student } from "@/types/student";

export default function InchargeAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tab, setTab] = useState<"driver" | "student">("driver");
  const [driverId, setDriverId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [busId, setBusId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([
      inchargeService.listAssignments(),
      inchargeService.listDrivers(),
      inchargeService.listBuses(),
      inchargeService.listRoutes(),
      inchargeService.listStudents(),
    ])
      .then(([a, d, b, r, s]) => {
        setAssignments(a.content);
        setDrivers(d.content.filter((x) => x.active !== false));
        setBuses(b.content.filter((x) => x.status === "ACTIVE" || x.status === "MAINTENANCE"));
        setRoutes(r.content);
        setStudents(s.content.filter((x) => x.active !== false));
      })
      .catch(() => toast.error("Could not load assignments"));

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!busId || !routeId) {
      toast.error("Select a bus and route");
      return;
    }
    setSaving(true);
    try {
      if (tab === "driver") {
        if (!driverId) {
          toast.error("Select a driver");
          return;
        }
        await inchargeService.assignDriver({ driverId: Number(driverId), busId: Number(busId), routeId: Number(routeId) });
      } else {
        if (!studentId) {
          toast.error("Select a student");
          return;
        }
        await inchargeService.assignStudent({ studentId: Number(studentId), busId: Number(busId), routeId: Number(routeId) });
      }
      toast.success("Assignment created");
      setDriverId("");
      setStudentId("");
      setBusId("");
      setRouteId("");
      load();
    } catch {
      toast.error("Could not create assignment");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (assignment: Assignment) => {
    try {
      await inchargeService.deactivateAssignment(assignment.id, assignment.type);
      toast.success("Assignment deactivated");
      load();
    } catch {
      toast.error("Could not deactivate assignment");
    }
  };

  const active = assignments.filter((a) => a.active);

  return (
    <>
      <PageHeader eyebrow="Operations" title="Assignments" description="Connect drivers and students to buses and routes." />
      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <Card className="p-6">
          <div className="mb-5 flex rounded-xl bg-[var(--muted)] p-1">
            <button type="button" className={`flex-1 rounded-lg py-2 text-sm font-semibold ${tab === "driver" ? "bg-[var(--panel)] text-[var(--primary)]" : ""}`} onClick={() => setTab("driver")}>
              Assign driver
            </button>
            <button type="button" className={`flex-1 rounded-lg py-2 text-sm font-semibold ${tab === "student" ? "bg-[var(--panel)] text-[var(--primary)]" : ""}`} onClick={() => setTab("student")}>
              Assign student
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {tab === "driver" ? (
              <div>
                <Label htmlFor="driverId">Driver</Label>
                <Select id="driverId" className="mt-1" value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
                  <option value="">Select driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="studentId">Student</Label>
                <Select id="studentId" className="mt-1" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.studentCode})
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="busId">Bus</Label>
              <Select id="busId" className="mt-1" value={busId} onChange={(e) => setBusId(e.target.value)} required>
                <option value="">Select bus</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} · {b.plateNumber}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="routeId">Route</Label>
              <Select id="routeId" className="mt-1" value={routeId} onChange={(e) => setRouteId(e.target.value)} required>
                <option value="">Select route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </Select>
            </div>
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save assignment"}
            </Button>
          </form>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold">Active assignments</h2>
          <div className="mt-4 divide-y">
            {active.map((a) => (
              <div key={`${a.type ?? "A"}-${a.id}`} className="flex items-start justify-between gap-3 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{a.driverName ?? a.studentName ?? "Assignment"}</p>
                    {a.type && <Badge variant="slate">{a.type}</Badge>}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {a.routeName ?? "Route pending"}
                    {a.busNumber ? ` · Bus ${a.busNumber}` : ""}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deactivate(a)}>
                  Remove
                </Button>
              </div>
            ))}
            {!active.length && <p className="py-8 text-sm text-[var(--muted-foreground)]">No active assignments.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
