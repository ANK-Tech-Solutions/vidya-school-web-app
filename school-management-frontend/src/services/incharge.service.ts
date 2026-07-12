import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type { Bus } from "@/types/bus";
import type { Driver } from "@/types/driver";
import type { Route } from "@/types/route";
import type { Assignment } from "@/types/assignment";
import type { DashboardStats } from "@/types/dashboard";
import type { ReportSummary } from "@/types/reports";

const base = "/api/v1/incharge";

export const inchargeService = {
  dashboard: () => api.get<ApiResponse<DashboardStats>>(`${base}/dashboard`).then((r) => r.data.data),
  buses: () => api.get<ApiResponse<PageResponse<Bus>>>(`${base}/buses`, { params: { size: 100 } }).then((r) => r.data.data),
  routes: () => api.get<ApiResponse<PageResponse<Route>>>(`${base}/routes`, { params: { size: 100 } }).then((r) => r.data.data),
  drivers: () => api.get<ApiResponse<PageResponse<Driver>>>(`${base}/drivers`, { params: { size: 100 } }).then((r) => r.data.data),
  assignments: () => api.get<ApiResponse<PageResponse<Assignment>>>(`${base}/assignments`, { params: { size: 100 } }).then((r) => r.data.data),
  reportSummary: () => api.get<ApiResponse<ReportSummary>>(`${base}/reports/summary`).then((r) => r.data.data),
};
