import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type { AssignedBus, AssignedRoute, DriverDashboard, DriverProfile, LocationPayload, TodayStudent, Trip } from "@/types/driver-ops";

const base = "/api/v1/driver";
const get = async <T>(path: string, params?: Record<string, unknown>) => (await api.get<ApiResponse<T>>(`${base}${path}`, { params })).data.data;
const post = async <T>(path: string, payload?: unknown) => (await api.post<ApiResponse<T>>(`${base}${path}`, payload)).data.data;

export const driverOpsService = {
  getDashboard: () => get<DriverDashboard>("/dashboard"),
  getProfile: () => get<DriverProfile>("/profile"),
  updateProfile: (payload: Partial<DriverProfile>) => api.put<ApiResponse<DriverProfile>>(`${base}/profile`, payload).then((response) => response.data.data),
  getBus: () => get<AssignedBus>("/bus"),
  getRoute: () => get<AssignedRoute>("/route"),
  getTodayStudents: () => get<TodayStudent[]>("/students/today"),
  enableLocation: () => post<void>("/location/enable"),
  disableLocation: () => post<void>("/location/disable"),
  sendLocation: (payload: LocationPayload) => post<void>("/location", payload),
  startTrip: () => post<Trip>("/trip/start"),
  endTrip: () => post<Trip>("/trip/end"),
  sos: () => post<void>("/sos"),
  tripHistory: (params?: Record<string, unknown>) => get<PageResponse<Trip>>("/trip/history", params),
  activeTrip: () => get<Trip | null>("/trip/active"),
};
