import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type {
  AttendanceRecord,
  StudentBus,
  StudentDashboard,
  StudentDriver,
  StudentNotification,
  StudentProfile,
  StudentRoute,
  StudentTracking,
  StudentTrip,
} from "@/types/student-ops";

const base = "/api/v1/student";
const studentParams = (studentId?: number) => (studentId ? { studentId } : undefined);

const get = async <T>(path: string, studentId?: number, extra?: Record<string, unknown>) =>
  (await api.get<ApiResponse<T>>(`${base}${path}`, { params: { ...studentParams(studentId), ...extra } })).data.data;

function pageContent<T>(page: PageResponse<T> | T[] | null | undefined): T[] {
  if (!page) return [];
  if (Array.isArray(page)) return page;
  return page.content ?? [];
}

function mapDashboard(raw: Record<string, unknown>): StudentDashboard {
  const etaMinutes = raw.etaMinutes as number | null | undefined;
  return {
    trip: raw.tripStatus || raw.tripId
      ? {
          id: raw.tripId as number | undefined,
          status: raw.tripStatus as string | undefined,
          eta: etaMinutes != null ? `${etaMinutes} min` : undefined,
        }
      : null,
    bus: raw.busNumber ? { busNumber: raw.busNumber as string } : null,
    driver: raw.driverName ? { name: raw.driverName as string } : null,
    route: raw.routeName
      ? {
          name: raw.routeName as string,
          pickupStop: raw.studentStopName as string | undefined,
        }
      : null,
    eta: etaMinutes != null ? `${etaMinutes} min` : undefined,
    currentStopName: raw.currentStopName as string | undefined,
    studentStopName: raw.studentStopName as string | undefined,
    distanceRemainingKm: raw.distanceRemainingKm as number | undefined,
  };
}

function mapTracking(raw: Record<string, unknown>): StudentTracking {
  const etaMinutes = raw.etaMinutes as number | null | undefined;
  const distance = raw.distanceRemaining as number | null | undefined;
  return {
    trip: raw.tripId
      ? {
          id: raw.tripId as number,
          status: raw.tripStatus as string | undefined,
          eta: etaMinutes != null ? `${etaMinutes} min` : undefined,
        }
      : null,
    status: raw.tripStatus as string | undefined,
    latitude: raw.latitude as number | undefined,
    longitude: raw.longitude as number | undefined,
    heading: raw.heading as number | null | undefined,
    speed: raw.speed as number | null | undefined,
    distanceRemainingKm: distance ?? null,
    updatedAt: (raw.lastUpdated as string | undefined) ?? undefined,
    eta: etaMinutes != null ? `${etaMinutes} min` : undefined,
    schoolLatitude: raw.schoolLatitude as number | undefined,
    schoolLongitude: raw.schoolLongitude as number | undefined,
    pickupLatitude: raw.pickupLatitude as number | undefined,
    pickupLongitude: raw.pickupLongitude as number | undefined,
    currentStopName: raw.currentStopName as string | undefined,
    nextStopName: raw.nextStopName as string | undefined,
    studentStopName: raw.studentStopName as string | undefined,
    bus: raw.busNumber ? { busNumber: raw.busNumber as string } : null,
    route: raw.routeName ? { name: raw.routeName as string } : null,
  };
}

function mapTrip(raw: Record<string, unknown>): StudentTrip {
  return {
    id: raw.id as number | undefined,
    status: raw.status as string | undefined,
    startedAt: (raw.actualStart as string | undefined) ?? (raw.startedAt as string | undefined),
    endedAt: (raw.actualEnd as string | undefined) ?? (raw.endedAt as string | undefined),
    routeName: raw.routeName as string | undefined,
    busNumber: raw.busNumber as string | undefined,
  };
}

function mapAttendance(raw: Record<string, unknown>): AttendanceRecord {
  return {
    id: raw.id as number | undefined,
    date: (raw.recordedAt as string | undefined) ?? (raw.date as string | undefined),
    status: raw.status as string | undefined,
    pickupTime: raw.pickupTime as string | undefined,
    dropoffTime: raw.dropoffTime as string | undefined,
    remarks: (raw.rawPayload as string | undefined) ?? (raw.remarks as string | undefined),
  };
}

export const studentOpsService = {
  getDashboard: async (studentId?: number) =>
    mapDashboard((await get<Record<string, unknown>>("/dashboard", studentId)) as Record<string, unknown>),
  getChildren: async () => {
    const rows = (await get<Record<string, unknown>[]>("/children")) ?? [];
    return rows.map((row) => ({
      id: Number(row.id),
      studentCode: row.studentCode as string | undefined,
      name: (row.fullName as string | undefined) ?? (row.name as string | undefined),
      firstName: row.firstName as string | undefined,
      lastName: row.lastName as string | undefined,
      grade: row.grade as string | undefined,
      section: row.section as string | undefined,
    }));
  },
  getProfile: (studentId?: number) => get<StudentProfile>("/profile", studentId),
  getBus: (studentId?: number) => get<StudentBus | null>("/bus", studentId),
  getDriver: (studentId?: number) => get<StudentDriver | null>("/driver", studentId),
  getRoute: (studentId?: number) => get<StudentRoute | null>("/route", studentId),
  getTracking: async (studentId?: number) =>
    mapTracking((await get<Record<string, unknown>>("/tracking", studentId)) as Record<string, unknown>),
  getAttendance: async (studentId?: number) =>
    pageContent(await get<PageResponse<Record<string, unknown>>>("/attendance", studentId, { page: 0, size: 50 })).map(
      mapAttendance,
    ),
  getTripHistory: async (studentId?: number) =>
    pageContent(
      await get<PageResponse<Record<string, unknown>>>("/trips/history", studentId, { page: 0, size: 50 }),
    ).map(mapTrip),
  getNotifications: async (studentId?: number) =>
    pageContent(await get<PageResponse<StudentNotification>>("/notifications", studentId, { page: 0, size: 50 })),
  markNotificationRead: (notificationId: number) =>
    api.patch<ApiResponse<void>>(`${base}/notifications/${notificationId}/read`).then((response) => response.data.data),
};
