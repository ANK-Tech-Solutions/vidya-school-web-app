"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { assignmentService } from "@/services/assignment.service";
import type { Assignment } from "@/types/assignment";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tab, setTab] = useState<"driver" | "student">("driver");

  const load = () =>
    assignmentService
      .list()
      .then((x) => setAssignments(x.content))
      .catch(() => toast.error("Could not load assignments"));

  useEffect(() => {
    load();
  }, []);

  const submit = async (form: FormData) => {
    try {
      if (tab === "driver") {
        await assignmentService.assignDriver({
          driverId: Number(form.get("driverId")),
          busId: Number(form.get("busId")),
          routeId: Number(form.get("routeId")),
        });
      } else {
        await assignmentService.assignStudent({
          studentId: Number(form.get("studentId")),
          busId: Number(form.get("busId")),
          routeId: Number(form.get("routeId")),
        });
      }
      toast.success("Assignment created");
      load();
    } catch {
      toast.error("Could not create assignment");
    }
  };

  const deactivate = async (id: number) => {
    try {
      await assignmentService.deactivate(id);
      toast.success("Assignment deactivated");
      load();
    } catch {
      toast.error("Could not deactivate assignment");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Assignments"
        description="Connect people and vehicles to the right routes."
      />
      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <Card className="p-6">
          <div className="mb-5 flex rounded-xl bg-[var(--muted)] p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${tab === "driver" ? "bg-[var(--panel)] text-[var(--primary)]" : ""}`}
              onClick={() => setTab("driver")}
            >
              Assign driver
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${tab === "student" ? "bg-[var(--panel)] text-[var(--primary)]" : ""}`}
              onClick={() => setTab("student")}
            >
              Assign student
            </button>
          </div>
          <form action={submit} className="space-y-4">
            {tab === "driver" ? (
              <>
                <Field name="driverId" label="Driver ID" />
                <Field name="busId" label="Bus ID" />
              </>
            ) : (
              <>
                <Field name="studentId" label="Student ID" />
                <Field name="busId" label="Bus ID" />
              </>
            )}
            <Field name="routeId" label="Route ID" />
            <Button className="w-full" type="submit">
              Save assignment
            </Button>
          </form>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold">Active assignments</h2>
          <div className="mt-4 divide-y">
            {assignments
              .filter((a) => a.active)
              .map((a) => (
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
                  <Button variant="ghost" size="sm" onClick={() => deactivate(a.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            {!assignments.filter((a) => a.active).length && (
              <p className="py-8 text-sm text-[var(--muted-foreground)]">No active assignments.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input className="mt-1" id={name} name={name} type="number" required />
    </div>
  );
}
