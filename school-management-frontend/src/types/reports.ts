import type { PageResponse } from "@/types/common";

export interface TripReportRow {
  tripId: number; startedAt: string | null; endedAt: string | null; busNumber: string; driverName: string;
  routeName: string; tripType: string; status: string; distanceKm: number | null; studentsPicked: number | null; studentsDropped: number | null;
}
export interface AttendanceReportRow {
  attendanceId: number; recordedAt: string; studentName: string; studentCode: string; busNumber: string | null;
  tripId: number | null; eventType: string; method: string;
}
export interface ReportSummary {
  totalTrips: number; completedTrips: number; emergencyTrips: number; totalAttendance: number; activeBuses: number; studentsTransported: number;
}
export interface DriverPerformanceRow {
  driverId: number; driverName: string; completedTrips: number; distanceKm: number; emergencies: number;
}
export type TripReportPage = PageResponse<TripReportRow>;
export type AttendanceReportPage = PageResponse<AttendanceReportRow>;
