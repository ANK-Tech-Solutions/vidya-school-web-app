import type { RouteTrackStop } from "@/types/student-ops";

export interface ReplayPoint {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recordedAt: string;
}

export interface TripReplay {
  tripId: number;
  busNumber: string;
  driverName: string;
  routeName: string | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  totalDistanceKm: number | null;
  stops: RouteTrackStop[];
  points: ReplayPoint[];
}

export interface InchargeTripRow {
  tripId: number;
  busNumber: string;
  driverName: string;
  routeName: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
}
