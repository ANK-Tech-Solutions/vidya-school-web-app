import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";

export type StaffNotice = { id: number; title: string; body: string; priority?: string; publishedAt?: string };
export type StaffEvent = { id: number; title: string; description?: string; eventDate?: string; eventType?: string };
export type StaffDashboard = { notices: number; events: number; message: string };

const base = "/api/v1/staff";

export const staffService = {
  dashboard: () => api.get<ApiResponse<StaffDashboard>>(`${base}/dashboard`).then((r) => r.data.data),
  notices: () => api.get<ApiResponse<StaffNotice[]>>(`${base}/notices`).then((r) => r.data.data),
  calendar: () => api.get<ApiResponse<StaffEvent[]>>(`${base}/calendar`).then((r) => r.data.data),
};
