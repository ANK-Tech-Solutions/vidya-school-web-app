export interface RouteStop { id?: number; name: string; address?: string; latitude?: number; longitude?: number; stopOrder?: number; }
export interface Route { id: number; name: string; code: string; description?: string; active: boolean; stops: RouteStop[]; distanceKm?: number; estimatedDurationMins?: number; }
export type RoutePayload = Omit<Route, "id" | "active"> & { active?: boolean };
