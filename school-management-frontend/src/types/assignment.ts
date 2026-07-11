export interface Assignment {
  id: number;
  type?: "DRIVER" | "STUDENT";
  driverId?: number;
  driverName?: string;
  studentId?: number;
  studentName?: string;
  busId?: number;
  busNumber?: string;
  routeId?: number;
  routeName?: string;
  active: boolean;
  assignedAt?: string;
}

export interface DriverAssignmentPayload {
  driverId: number;
  busId: number;
  routeId: number;
}

export interface StudentAssignmentPayload {
  studentId: number;
  busId: number;
  routeId: number;
}
