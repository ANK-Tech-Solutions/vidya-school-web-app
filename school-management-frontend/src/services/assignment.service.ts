import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type { Assignment, DriverAssignmentPayload, StudentAssignmentPayload } from "@/types/assignment";

const base = "/api/v1/admin/assignments";

export const assignmentService = {
  list: async (params?: Record<string, unknown>) =>
    (await api.get<ApiResponse<PageResponse<Assignment>>>(base, { params: { size: 100, ...params } })).data.data,
  assignDriver: async (payload: DriverAssignmentPayload) =>
    (await api.post<ApiResponse<Assignment>>(`${base}/drivers`, payload)).data.data,
  assignStudent: async (payload: StudentAssignmentPayload) =>
    (await api.post<ApiResponse<Assignment>>(`${base}/students`, payload)).data.data,
  deactivate: async (id: number, type?: "DRIVER" | "STUDENT") =>
    (await api.patch<ApiResponse<Assignment>>(`${base}/${id}/deactivate`, null, { params: type ? { type } : undefined })).data.data,
};
