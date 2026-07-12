"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { staffService, type StaffEvent } from "@/services/staff.service";

export default function StaffCalendarPage() {
  const [rows, setRows] = useState<StaffEvent[]>([]);
  useEffect(() => {
    staffService.calendar().then(setRows).catch(() => toast.error("Could not load calendar"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Schedule" title="Calendar" description="Upcoming school events for staff." />
      <div className="space-y-3">
        {rows.map((e) => (
          <Card key={e.id} className="p-5">
            <p className="font-semibold">{e.title}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{e.eventDate ?? "Date TBA"} · {e.eventType ?? "GENERAL"}</p>
            {e.description && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{e.description}</p>}
          </Card>
        ))}
        {!rows.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No events yet.</Card>}
      </div>
    </>
  );
}
