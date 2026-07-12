"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export default function FleetMovedPage() {
  return (
    <>
      <PageHeader eyebrow="Moved" title="Fleet managed elsewhere" description="Bus-related tools were moved out of Admin." />
      <Card className="p-6 text-sm text-[var(--muted-foreground)]">
        Buses, drivers, routes, assignments, live tracking, and transport reports now live in the <strong>Vehicle Incharge</strong> portal.
        Day-to-day trip control stays in the <strong>Driver</strong> portal. Create fleet managers under <strong>Admin → Vehicle incharges</strong>, then they sign in at <code>/incharge</code>.
      </Card>
    </>
  );
}
