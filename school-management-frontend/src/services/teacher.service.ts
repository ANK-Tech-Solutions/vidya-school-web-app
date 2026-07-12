import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface TeacherPayload { username: string; email: string; password?: string; firstName: string; lastName: string; phone?: string; employeeCode?: string; department?: string; subjects?: string; joinDate?: string; phoneExtension?: string; active?: boolean }
export const teacherService = {
  list: (page = 0, size = 100) => api.get<ApiResponse<{ content: TeacherPayload[] }>>(`/api/v1/admin/teachers?page=${page}&size=${size}`).then((r) => r.data.data),
  create: (payload: TeacherPayload) => api.post("/api/v1/admin/teachers", payload).then((r) => r.data.data),
  update: (id: number, payload: TeacherPayload) => api.put(`/api/v1/admin/teachers/${id}`, payload).then((r) => r.data.data),
  deactivate: (id: number) => api.patch(`/api/v1/admin/teachers/${id}/deactivate`).then((r) => r.data.data),
};
