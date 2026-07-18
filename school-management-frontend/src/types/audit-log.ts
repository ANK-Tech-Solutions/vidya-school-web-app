import type { PageResponse } from "@/types/common";

export interface AuditLogRow {
  id: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  userId: number | null;
  username: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export type AuditLogPage = PageResponse<AuditLogRow>;
