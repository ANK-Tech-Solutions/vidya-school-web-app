export interface Driver { id: number; userId?: number; username: string; email: string; firstName: string; lastName: string; licenseNumber: string; online: boolean; locationEnabled: boolean; active: boolean; }
export type DriverPayload = Omit<Driver, "id" | "userId" | "online" | "locationEnabled" | "active"> & { password?: string; active?: boolean };
