"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inchargeService } from "@/services/incharge.service";
import type { Assignment } from "@/types/assignment";

export default function InchargeAssignmentsPage() {
  const [rows, setRows] = useState<Assignment[]>([]);
  useEffect(() => {
    inchargeService
      .assignments()
      .then((d) => setRows(d.content.filter((a) => a.active)))
      .catch(() => toast.error("Could not load assignments"));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Operations" title="Assignments" description="Active driver and student bus assignments." />
      <div className="space-y-3">
        {rows.map((a) => (
          <Card key={`${a.type}-${a.id}`} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">{a.driverName ?? a.studentName ?? "Assignment"}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {a.routeName ?? "Route pending"}
                {a.busNumber ? ` · Bus ${a.busNumber}` : ""}
              </p>
            </div>
            {a.type && <Badge variant="slate">{a.type}</Badge>}
          </Card>
        ))}
        {!rows.length && <Card className="p-8 text-sm text-[var(--muted-foreground)]">No active assignments.</Card>}
      </div>
    </>
  );
}
