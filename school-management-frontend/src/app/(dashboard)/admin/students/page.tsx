"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Power } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { PageToolbar } from "@/components/admin/page-toolbar";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { parentService } from "@/services/parent.service";
import { studentService } from "@/services/student.service";
import type { Parent } from "@/types/parent";
import type { Student } from "@/types/student";

const schema = z.object({
  studentCode: z.string().min(1, "Student code is required"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  grade: z.string().min(1),
  section: z.string().min(1),
  parentId: z.string().optional(),
  pickupAddress: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional(),
});
type Values = z.infer<typeof schema>;
const blank: Values = { studentCode: "", firstName: "", lastName: "", grade: "", section: "", parentId: "", pickupAddress: "", username: "", email: "", password: "" };

export default function StudentsPage() {
  const [rows, setRows] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [deactivate, setDeactivate] = useState<Student | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: blank });

  const load = () => {
    setLoading(true);
    Promise.all([studentService.list({ search, size: 100 }), parentService.list({ size: 100 })])
      .then(([data, parentData]) => {
        setRows(data.content);
        setParents(parentData.content.filter((p) => p.active !== false));
      })
      .catch(() => toast.error("Could not load students"))
      .finally(() => setLoading(false));
  };

  // `load` intentionally reads the current search value and is debounced here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const open = (student?: Student) => {
    setSelected(student ?? null);
    form.reset(
      student
        ? {
            studentCode: student.studentCode,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            section: student.section,
            parentId: student.parentId?.toString() ?? "",
            pickupAddress: student.pickupAddress ?? "",
            username: "",
            email: "",
            password: "",
          }
        : blank,
    );
    setDialog(true);
  };

  const submit = async (values: Values) => {
    const payload = {
      studentCode: values.studentCode,
      firstName: values.firstName,
      lastName: values.lastName,
      grade: values.grade,
      section: values.section,
      pickupAddress: values.pickupAddress || undefined,
      parentId: values.parentId ? Number(values.parentId) : undefined,
      username: values.username || undefined,
      email: values.email || undefined,
      password: values.password || undefined,
    };
    try {
      if (selected) await studentService.update(selected.id, payload);
      else await studentService.create(payload);
      toast.success(`Student ${selected ? "updated" : "created"}`);
      setDialog(false);
      load();
    } catch {
      toast.error("Could not save student");
    }
  };

  const remove = async () => {
    if (!deactivate) return;
    try {
      await studentService.deactivate(deactivate.id);
      toast.success("Student deactivated");
      setDeactivate(null);
      load();
    } catch {
      toast.error("Could not deactivate student");
    }
  };

  return (
    <>
      <PageHeader eyebrow="People" title="Students" description="Manage student records and pickup information." />
      <PageToolbar search={search} onSearch={setSearch} actionLabel="Add student" onAction={() => open()} />
      <DataTable title={`${rows.length} students`}>
        <div className="hidden min-w-190 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--muted)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="p-4">Student</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Pickup</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-4 font-semibold">
                      {s.firstName} {s.lastName}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">{s.studentCode}</span>
                    </td>
                    <td>
                      {s.grade} · {s.section}
                    </td>
                    <td>{s.parentName ?? "—"}</td>
                    <td>{s.pickupAddress ?? "—"}</td>
                    <td>
                      <Badge variant={s.active ? "default" : "slate"}>{s.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="pr-4">
                      <button onClick={() => open(s)} aria-label="Edit student" className="p-2 text-[var(--primary)]">
                        <Pencil size={16} />
                      </button>
                      {s.active && (
                        <button onClick={() => setDeactivate(s)} aria-label="Deactivate student" className="p-2 text-red-500">
                          <Power size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !rows.length && <EmptyState title="No students found" action={{ label: "Add student", onClick: () => open() }} />}
        <div className="divide-y md:hidden">
          {rows.map((s) => (
            <div key={s.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {s.studentCode} · {s.grade} {s.section}
                  </p>
                </div>
                <Badge variant={s.active ? "default" : "slate"}>{s.active ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{s.parentName ?? "No parent assigned"}</p>
            </div>
          ))}
        </div>
      </DataTable>
      <Dialog open={dialog} onClose={() => setDialog(false)} title={selected ? "Edit student" : "Add student"}>
        <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["studentCode", "Student code"],
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["grade", "Grade"],
              ["section", "Section"],
              ["pickupAddress", "Pickup address"],
              ["username", "Login username"],
              ["email", "Login email"],
              ["password", "Login password"],
            ] as const
          ).map(([name, label]) => (
            <div key={name} className={name === "pickupAddress" ? "sm:col-span-2" : ""}>
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} type={name === "password" ? "password" : name === "email" ? "email" : "text"} className="mt-1" {...form.register(name)} />
              {form.formState.errors[name] && <p className="mt-1 text-xs text-red-500">{form.formState.errors[name]?.message}</p>}
            </div>
          ))}
          <div className="sm:col-span-2">
            <Label htmlFor="parentId">Parent</Label>
            <Select id="parentId" className="mt-1" {...form.register("parentId")}>
              <option value="">No parent linked</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.username})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button variant="outline" type="button" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Save student</Button>
          </div>
        </form>
      </Dialog>
      <ConfirmDialog open={!!deactivate} onClose={() => setDeactivate(null)} onConfirm={remove} title="Deactivate student" />
    </>
  );
}
