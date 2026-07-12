import type { Notification } from "@/types/notification";

export interface StudentChild {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  studentCode?: string;
  grade?: string;
  section?: string;
}

export interface StudentBus {
  id?: number;
  busNumber?: string;
  registrationNumber?: string;
  model?: string;
  status?: string;
}

export interface StudentDriver {
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  photoUrl?: string;
}

export interface StudentRoute {
  id?: number;
  name?: string;
  code?: string;
  pickupStop?: string;
  pickupTime?: string;
  estimatedDurationMins?: number;
}

export interface StudentTrip {
  id?: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | string;
  startedAt?: string;
  endedAt?: string;
  routeName?: string;
  busNumber?: string;
  pickupTime?: string;
  eta?: string;
}

export interface StudentDashboard {
  trip?: StudentTrip | null;
  bus?: StudentBus | null;
  driver?: StudentDriver | null;
  route?: StudentRoute | null;
  eta?: string;
  pickupTime?: string;
  currentStopName?: string;
  studentStopName?: string;
  distanceRemainingKm?: number;
}

export interface RouteTrackStop {
  id?: number;
  name: string;
  stopOrder?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  estimatedArrivalMins?: number;
}

export interface StudentTracking {
  trip?: StudentTrip | null;
  status?: string;
  latitude?: number;
  longitude?: number;
  heading?: number | null;
  speed?: number | null;
  distanceRemainingKm?: number | null;
  updatedAt?: string;
  eta?: string;
  schoolLatitude?: number;
  schoolLongitude?: number;
  pickupLatitude?: number;
  pickupLongitude?: number;
  currentStopId?: number;
  currentStopName?: string;
  currentStopOrder?: number;
  nextStopId?: number;
  nextStopName?: string;
  studentStopId?: number;
  studentStopName?: string;
  bus?: StudentBus | null;
  route?: StudentRoute | null;
  stops?: RouteTrackStop[];
}

export interface AttendanceRecord {
  id?: number;
  date?: string;
  status?: string;
  pickupTime?: string;
  dropoffTime?: string;
  tripId?: number;
  remarks?: string;
}

export interface StudentProfile {
  id?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  studentCode?: string;
  admissionNumber?: string;
  grade?: string;
  section?: string;
  email?: string;
  phone?: string;
  pickupAddress?: string;
  parentName?: string;
}

export type StudentNotification = Notification;
