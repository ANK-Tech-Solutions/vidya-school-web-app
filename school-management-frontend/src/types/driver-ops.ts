export interface AssignedBus {
  id?: number;
  busNumber?: string;
  registrationNumber?: string;
  model?: string;
  capacity?: number;
  status?: string;
}

export interface RouteStop {
  id?: number;
  name: string;
  address?: string;
  order?: number;
  pickupTime?: string;
  latitude?: number;
  longitude?: number;
}

export interface AssignedRoute {
  id?: number;
  name?: string;
  code?: string;
  description?: string;
  distanceKm?: number;
  estimatedDurationMins?: number;
  stops?: RouteStop[];
}

export interface DriverDashboard {
  online?: boolean;
  locationEnabled?: boolean;
  activeTrip?: Trip | null;
  assignedBus?: AssignedBus | null;
  assignedRoute?: AssignedRoute | null;
  todayStudents?: number;
}

export interface DriverProfile {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  username?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  photoUrl?: string;
}

export interface TodayStudent {
  id?: number;
  studentId?: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  admissionNumber?: string;
  grade?: string;
  section?: string;
  stopName?: string;
  pickupTime?: string;
  pickupStatus?: string;
  guardianPhone?: string;
  studentCode?: string;
  photoUrl?: string;
}

export interface Trip {
  id?: number;
  status?: "STARTED" | "IN_PROGRESS" | "COMPLETED" | "ENDED" | string;
  startedAt?: string;
  endedAt?: string;
  routeName?: string;
  busNumber?: string;
  studentCount?: number;
  distanceKm?: number;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
  heading?: number | null;
  timestamp?: string;
}
