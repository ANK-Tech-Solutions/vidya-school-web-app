import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type {
  AssignedBus,
  AssignedRoute,
  DriverDashboard,
  DriverProfile,
  LocationPayload,
  TodayStudent,
  Trip,
} from "@/types/driver-ops";

const base = "/api/v1/driver";

const get = async <T>(path: string, params?: Record<string, unknown>) =>
  (await api.get<ApiResponse<T>>(`${base}${path}`, { params })).data.data;

const post = async <T>(path: string, payload?: unknown) =>
  (await api.post<ApiResponse<T>>(`${base}${path}`, payload ?? {})).data.data;

function mapTrip(raw: Record<string, unknown> | null | undefined): Trip | null {
  if (!raw) return null;
  return {
    id: raw.id as number | undefined,
    status: raw.status as string | undefined,
    startedAt: (raw.actualStart as string | undefined) ?? (raw.startedAt as string | undefined),
    endedAt: (raw.actualEnd as string | undefined) ?? (raw.endedAt as string | undefined),
    routeName: raw.routeName as string | undefined,
    busNumber: raw.busNumber as string | undefined,
    studentCount:
      (raw.studentsPicked as number | undefined) ??
      (raw.studentCount as number | undefined) ??
      0,
    distanceKm: raw.distanceKm as number | undefined,
  };
}

function mapBus(raw: Record<string, unknown> | null | undefined): AssignedBus | null {
  if (!raw) return null;
  return {
    id: raw.id as number | undefined,
    busNumber: raw.busNumber as string | undefined,
    registrationNumber: (raw.plateNumber as string | undefined) ?? (raw.registrationNumber as string | undefined),
    capacity: raw.capacity as number | undefined,
    status: raw.status as string | undefined,
  };
}

function mapRoute(raw: Record<string, unknown> | null | undefined): AssignedRoute | null {
  if (!raw) return null;
  const stops = Array.isArray(raw.stops)
    ? raw.stops.map((stop) => {
        const item = stop as Record<string, unknown>;
        return {
          id: item.id as number | undefined,
          name: String(item.name ?? "Stop"),
          address: item.address as string | undefined,
          order: (item.stopOrder as number | undefined) ?? (item.order as number | undefined),
          latitude: item.latitude as number | undefined,
          longitude: item.longitude as number | undefined,
        };
      })
    : [];
  return {
    id: raw.id as number | undefined,
    name: raw.name as string | undefined,
    code: raw.code as string | undefined,
    description: raw.description as string | undefined,
    distanceKm: raw.distanceKm as number | undefined,
    estimatedDurationMins: raw.estimatedDurationMins as number | undefined,
    stops,
  };
}

function mapDashboard(raw: Record<string, unknown>): DriverDashboard {
  const assignedBus =
    mapBus(raw.assignedBus as Record<string, unknown> | null | undefined) ??
    (raw.busNumber
      ? { busNumber: raw.busNumber as string }
      : null);
  const assignedRoute =
    mapRoute(raw.assignedRoute as Record<string, unknown> | null | undefined) ??
    (raw.routeName ? { name: raw.routeName as string, stops: [] } : null);
  return {
    online: raw.online as boolean | undefined,
    locationEnabled: raw.locationEnabled as boolean | undefined,
    activeTrip: mapTrip(raw.activeTrip as Record<string, unknown> | null | undefined),
    assignedBus,
    assignedRoute,
    todayStudents: Number(raw.todayStudents ?? 0),
  };
}

function mapStudent(raw: Record<string, unknown>): TodayStudent {
  return {
    studentId: raw.studentId as number | undefined,
    name: raw.name as string | undefined,
    grade: raw.grade as string | undefined,
    section: raw.section as string | undefined,
    stopName: raw.stopName as string | undefined,
    pickupStatus: "Scheduled",
  };
}

function toLocationBody(payload: LocationPayload) {
  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    accuracy: payload.accuracy ?? null,
    speed: payload.speed ?? null,
    heading: payload.heading ?? null,
    recordedAt: payload.timestamp ?? new Date().toISOString(),
  };
}

export const driverOpsService = {
  getDashboard: async () => mapDashboard((await get<Record<string, unknown>>("/dashboard")) as Record<string, unknown>),
  getProfile: () => get<DriverProfile>("/profile"),
  updateProfile: (payload: Partial<DriverProfile>) =>
    api
      .put<ApiResponse<DriverProfile>>(`${base}/profile`, {
        phone: payload.phone,
        emergencyContact: undefined,
        address: undefined,
        bloodGroup: undefined,
      })
      .then((response) => response.data.data),
  getBus: async () => mapBus(await get<Record<string, unknown> | null>("/bus")),
  getRoute: async () => mapRoute(await get<Record<string, unknown> | null>("/route")),
  getTodayStudents: async () => {
    const rows = (await get<Record<string, unknown>[]>("/students/today")) ?? [];
    return rows.map(mapStudent);
  },
  enableLocation: () => post<void>("/location/enable"),
  disableLocation: () => post<void>("/location/disable"),
  sendLocation: (payload: LocationPayload) => post<void>("/location", toLocationBody(payload)),
  startTrip: async () => mapTrip((await post<Record<string, unknown>>("/trips/start", {})) as Record<string, unknown>)!,
  endTrip: async () => mapTrip((await post<Record<string, unknown>>("/trips/end", {})) as Record<string, unknown>)!,
  sos: () => post<void>("/trips/sos", {}),
  tripHistory: async (params?: Record<string, unknown>) => {
    const page = await get<PageResponse<Record<string, unknown>>>("/trips/history", params);
    return {
      ...page,
      content: (page.content ?? []).map((item) => mapTrip(item)!),
    };
  },
  activeTrip: async () => mapTrip(await get<Record<string, unknown> | null>("/trips/active")),
  addStop: async (payload: { name: string; latitude: number; longitude: number; address?: string }) =>
    post<Record<string, unknown>>("/route/stops", payload),
};
