import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";

export type AcademicRecord = Record<string, unknown> & { id?: number; title?: string; name?: string };
export type AcademicPayload = Record<string, unknown>;

const unwrap = <T,>(path: string) => api.get<ApiResponse<T>>(path).then((r) => r.data.data);

export const academicService = {
  get: (path: string) => unwrap<unknown>(path),
  create: (path: string, payload: AcademicPayload) => api.post(path, payload).then((r) => r.data.data),
  update: (path: string, payload: AcademicPayload) => api.put(path, payload).then((r) => r.data.data),
  patch: (path: string, payload?: AcademicPayload) => api.patch(path, payload ?? {}).then((r) => r.data.data),
  remove: (path: string) => api.delete(path).then((r) => r.data.data),
  markAttendance: (payload: { date: string; attendance: { studentId: number; status: string; remarks?: string }[] }) =>
    api.post("/api/v1/teacher/class-attendance", payload).then((r) => r.data.data),
};
