import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AttendanceRecord,
  StudentBus,
  StudentChild,
  StudentDashboard,
  StudentDriver,
  StudentNotification,
  StudentProfile,
  StudentRoute,
  StudentTracking,
  StudentTrip,
} from "@/types/student-ops";

const base = "/api/v1/student";
const studentParams = (studentId?: number) => studentId ? { studentId } : undefined;
const get = async <T>(path: string, studentId?: number) => (await api.get<ApiResponse<T>>(`${base}${path}`, { params: studentParams(studentId) })).data.data;

export const studentOpsService = {
  getDashboard: (studentId?: number) => get<StudentDashboard>("/dashboard", studentId),
  getChildren: () => get<StudentChild[]>("/children"),
  getProfile: (studentId?: number) => get<StudentProfile>("/profile", studentId),
  getBus: (studentId?: number) => get<StudentBus | null>("/bus", studentId),
  getDriver: (studentId?: number) => get<StudentDriver | null>("/driver", studentId),
  getRoute: (studentId?: number) => get<StudentRoute | null>("/route", studentId),
  getTracking: (studentId?: number) => get<StudentTracking>("/tracking", studentId),
  getAttendance: (studentId?: number) => get<AttendanceRecord[]>("/attendance", studentId),
  getTripHistory: (studentId?: number) => get<StudentTrip[]>("/trip-history", studentId),
  getNotifications: (studentId?: number) => get<StudentNotification[]>("/notifications", studentId),
  markNotificationRead: (notificationId: number) => api.patch<ApiResponse<void>>(`${base}/notifications/${notificationId}/read`).then((response) => response.data.data),
};
