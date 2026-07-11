export type BusStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE" | "RETIRED";
export interface Bus { id: number; busNumber: string; plateNumber: string; capacity: number; status: BusStatus; make?: string; model?: string; }
export type BusPayload = Omit<Bus, "id">;
