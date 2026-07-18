import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AuditLogPage } from "@/types/audit-log";

export const auditLogService = {
  list: async (params: { action?: string; page?: number; size?: number }) =>
    (await api.get<ApiResponse<AuditLogPage>>("/api/v1/admin/audit-logs", { params })).data.data,
};
