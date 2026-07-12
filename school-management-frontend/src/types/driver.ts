export interface Driver {
  id: number;
  userId?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  online: boolean;
  locationEnabled: boolean;
  active: boolean;
  lastLatitude?: number | null;
  lastLongitude?: number | null;
  lastLocationAt?: string | null;
}

export type DriverPayload = Omit<Driver, "id" | "userId" | "online" | "locationEnabled" | "active" | "lastLatitude" | "lastLongitude" | "lastLocationAt"> & {
  password?: string;
  active?: boolean;
};
