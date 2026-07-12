"use client";

import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { academicService, type AcademicRecord } from "@/services/academic.service";

type Field = { name: string; label: string; type?: string; required?: boolean };

function asRecords(data: unknown): AcademicRecord[] {
  if (Array.isArray(data)) {
    return data.map((row) => (typeof row === "number" ? { id: row } : (row as AcademicRecord)));
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if ("id" in obj || "title" in obj || "name" in obj) return [obj as AcademicRecord];
    return Object.entries(obj).map(([key, value], index) => ({
      id: index + 1,
      title: key,
      description: String(value ?? ""),
    }));
  }
  return [];
}

function detailLines(record: AcademicRecord) {
  const skip = new Set(["id", "title", "name", "body", "description", "active"]);
  return Object.entries(record)
    .filter(([key, value]) => !skip.has(key) && value != null && value !== "")
    .slice(0, 6)
    .map(([key, value]) => `${key}: ${String(value)}`);
}

export function AcademicModule({
  title,
  description,
  endpoint,
  createEndpoint,
  createLabel = "Create",
  fields,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  endpoint: string;
  createEndpoint?: string;
  createLabel?: string;
  fields?: Field[];
  actionLabel?: string;
  onAction?: (record: AcademicRecord) => Promise<void>;
}) {
  const [rows, setRows] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const formFields = useMemo<Field[]>(
    () =>
      fields ?? [
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Details", type: "textarea" },
      ],
    [fields],
  );

  const load = () => {
    setLoading(true);
    academicService
      .get(endpoint)
      .then((data) => setRows(asRecords(data)))
      .catch(() => toast.error(`Could not load ${title.toLowerCase()}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const create = async (form: FormData) => {
    if (!createEndpoint) return;
    const payload: Record<string, unknown> = {};
    for (const field of formFields) {
      const value = String(form.get(field.name) ?? "").trim();
      if (!value && field.required) {
        toast.error(`${field.label} is required`);
        return;
      }
      if (value) {
        if (["studentId", "teacherId", "dayOfWeek", "periodNo", "amount", "grossAmount", "netAmount", "deductions", "maxMarks"].includes(field.name)) {
          payload[field.name] = Number(value);
        } else if (field.name === "title") {
          payload.title = value;
          payload.name = value;
        } else if (field.name === "name") {
          payload.name = value;
          payload.title = value;
        } else if (field.name === "description") {
          payload.description = value;
          payload.body = value;
          payload.reason = value;
        } else {
          payload[field.name] = value;
        }
      }
    }
    if (payload.title && !payload.body) payload.body = payload.description ?? payload.title;
    if (payload.description && !payload.body) payload.body = payload.description;
    try {
      await academicService.create(createEndpoint, payload);
      toast.success(`${title} saved`);
      setAdding(false);
      load();
    } catch {
      toast.error(`Could not save ${title.toLowerCase()}`);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Academic hub" title={title} description={description} />
      <div className="mb-5 flex justify-end gap-2">
        <Button variant="outline" onClick={load}>
          <RefreshCw size={16} />
          Refresh
        </Button>
        {createEndpoint && (
          <Button onClick={() => setAdding(!adding)}>
            <Plus size={16} />
            {createLabel}
          </Button>
        )}
      </div>
      {adding && (
        <Card className="mb-6 p-5">
          <form action={create} className="grid gap-3 sm:grid-cols-2">
            {formFields.map((field) =>
              field.type === "textarea" ? (
                <Textarea key={field.name} name={field.name} placeholder={field.label} required={field.required} className="sm:col-span-2" />
              ) : (
                <Input key={field.name} name={field.name} type={field.type ?? "text"} placeholder={field.label} required={field.required} />
              ),
            )}
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>
      )}
      {loading ? (
        <Card className="p-8 text-sm text-[var(--muted-foreground)]">Loading {title.toLowerCase()}…</Card>
      ) : !rows.length ? (
        <Card className="p-10 text-center">
          <p className="font-display text-lg font-bold">Nothing here yet</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">New {title.toLowerCase()} will appear here when available.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((record, index) => (
            <motion.div key={`${record.id}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">#{record.id}</p>
                    <h2 className="mt-2 font-display text-lg font-bold">{String(record.title ?? record.name ?? title)}</h2>
                  </div>
                  {record.status != null ? <Badge variant="slate">{String(record.status)}</Badge> : null}
                  {record.priority != null ? <Badge>{String(record.priority)}</Badge> : null}
                </div>
                {(record.body || record.description || record.reason) ? (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{String(record.body ?? record.description ?? record.reason)}</p>
                ) : null}
                <ul className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
                  {detailLines(record).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {actionLabel && onAction && (
                  <Button
                    className="mt-4"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await onAction(record);
                        toast.success("Updated");
                        load();
                      } catch {
                        toast.error("Action failed");
                      }
                    }}
                  >
                    {actionLabel}
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
