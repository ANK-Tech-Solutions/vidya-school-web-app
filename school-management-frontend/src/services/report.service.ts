import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AttendanceReportPage, DriverPerformanceRow, ReportSummary, TripReportPage } from "@/types/reports";

type DateRange = { from?: string; to?: string };

export const reportService = {
  trips: async (params: DateRange & { page?: number; size?: number }) =>
    (await api.get<ApiResponse<TripReportPage>>("/api/v1/admin/reports/trips", { params })).data.data,
  attendance: async (params: DateRange & { page?: number; size?: number }) =>
    (await api.get<ApiResponse<AttendanceReportPage>>("/api/v1/admin/reports/attendance", { params })).data.data,
  summary: async (params: DateRange) =>
    (await api.get<ApiResponse<ReportSummary>>("/api/v1/admin/reports/summary", { params })).data.data,
  driverPerformance: async (params: DateRange) =>
    (await api.get<ApiResponse<DriverPerformanceRow[]>>("/api/v1/admin/reports/drivers/performance", { params })).data.data,
};
