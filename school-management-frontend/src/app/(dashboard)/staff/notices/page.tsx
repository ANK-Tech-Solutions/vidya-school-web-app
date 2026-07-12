"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { staffService, type StaffNotice } from "@/services/staff.service";

export default function StaffNoticesPage() {
  const [rows, setRows] = useState<StaffNotice[]>([]);
  useEffect(() => {
    staffService.notices().then(setRows).catch(() => toast.error("Could not load notices"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Updates" title="Notice board" description="School communications for staff." />
      <div className="space-y-3">
        {rows.map((n) => (
          <Card key={n.id} className="p-5">
            <p className="font-semibold">{n.title}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{n.body}</p>
          </Card>
        ))}
        {!rows.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No notices yet.</Card>}
      </div>
    </>
  );
}
