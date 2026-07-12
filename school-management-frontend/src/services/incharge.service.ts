import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type { Bus, BusPayload } from "@/types/bus";
import type { Driver, DriverPayload } from "@/types/driver";
import type { Route, RoutePayload } from "@/types/route";
import type { Assignment, DriverAssignmentPayload, StudentAssignmentPayload } from "@/types/assignment";
import type { Student } from "@/types/student";
import type { DashboardStats } from "@/types/dashboard";
import type { ReportSummary, TripReportRow } from "@/types/reports";

const base = "/api/v1/incharge";

export const inchargeService = {
  dashboard: () => api.get<ApiResponse<DashboardStats>>(`${base}/dashboard`).then((r) => r.data.data),

  listBuses: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Bus>>>(`${base}/buses`, { params: { size: 100, ...params } }).then((r) => r.data.data),
  createBus: (payload: BusPayload) => api.post<ApiResponse<Bus>>(`${base}/buses`, payload).then((r) => r.data.data),
  updateBus: (id: number, payload: BusPayload) => api.put<ApiResponse<Bus>>(`${base}/buses/${id}`, payload).then((r) => r.data.data),
  deactivateBus: (id: number) => api.patch(`${base}/buses/${id}/deactivate`).then((r) => r.data.data),

  listRoutes: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Route>>>(`${base}/routes`, { params: { size: 100, ...params } }).then((r) => r.data.data),
  createRoute: (payload: RoutePayload) => api.post<ApiResponse<Route>>(`${base}/routes`, payload).then((r) => r.data.data),
  updateRoute: (id: number, payload: RoutePayload) => api.put<ApiResponse<Route>>(`${base}/routes/${id}`, payload).then((r) => r.data.data),
  deactivateRoute: (id: number) => api.patch(`${base}/routes/${id}/deactivate`).then((r) => r.data.data),
  addStop: (routeId: number, payload: import("@/types/route").RouteStop & { stopOrder?: number }) =>
    api.post(`${base}/routes/${routeId}/stops`, {
      name: payload.name,
      stopOrder: payload.stopOrder,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address,
    }).then((r) => r.data.data),
  updateStop: (routeId: number, stopId: number, payload: import("@/types/route").RouteStop & { stopOrder?: number }) =>
    api.put(`${base}/routes/${routeId}/stops/${stopId}`, {
      name: payload.name,
      stopOrder: payload.stopOrder,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address,
    }).then((r) => r.data.data),
  deleteStop: (routeId: number, stopId: number) =>
    api.delete(`${base}/routes/${routeId}/stops/${stopId}`).then((r) => r.data.data),

  listDrivers: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Driver>>>(`${base}/drivers`, { params: { size: 100, ...params } }).then((r) => r.data.data),
  createDriver: (payload: DriverPayload) => api.post<ApiResponse<Driver>>(`${base}/drivers`, payload).then((r) => r.data.data),
  updateDriver: (id: number, payload: DriverPayload) => api.put<ApiResponse<Driver>>(`${base}/drivers/${id}`, payload).then((r) => r.data.data),
  deactivateDriver: (id: number) => api.patch(`${base}/drivers/${id}/deactivate`).then((r) => r.data.data),

  listStudents: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Student>>>(`${base}/students`, { params: { size: 100, ...params } }).then((r) => r.data.data),

  listAssignments: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<Assignment>>>(`${base}/assignments`, { params: { size: 100, ...params } }).then((r) => r.data.data),
  assignDriver: (payload: DriverAssignmentPayload) =>
    api.post<ApiResponse<Assignment>>(`${base}/assignments/drivers`, payload).then((r) => r.data.data),
  assignStudent: (payload: StudentAssignmentPayload) =>
    api.post<ApiResponse<Assignment>>(`${base}/assignments/students`, payload).then((r) => r.data.data),
  deactivateAssignment: (id: number, type?: "DRIVER" | "STUDENT") =>
    api.patch(`${base}/assignments/${id}/deactivate`, null, { params: type ? { type } : undefined }).then((r) => r.data.data),

  reportSummary: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<ReportSummary>>(`${base}/reports/summary`, { params }).then((r) => r.data.data),
  reportTrips: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<PageResponse<TripReportRow>>>(`${base}/reports/trips`, { params: { size: 100, ...params } }).then((r) => r.data.data),

  buses: () => inchargeService.listBuses(),
  routes: () => inchargeService.listRoutes(),
  drivers: () => inchargeService.listDrivers(),
  assignments: () => inchargeService.listAssignments(),
};
