"use client";

import { AcademicModule } from "@/components/academic/academic-module";
import { academicService } from "@/services/academic.service";

export default function AdminLeavesPage() {
  return (
    <AcademicModule
      title="Leave approvals"
      description="Review student and teacher leave requests."
      endpoint="/api/v1/admin/leaves"
      actionLabel="Approve"
      onAction={async (record) => {
        await academicService.patch(`/api/v1/admin/leaves/${record.id}/APPROVED`, { remarks: "Approved" });
      }}
    />
  );
}
