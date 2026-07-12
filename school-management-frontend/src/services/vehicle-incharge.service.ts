import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";

export type VehicleIncharge = {
  id: number;
  userId: number;
  schoolId: number;
  schoolCode?: string;
  schoolName?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
};

export type VehicleInchargePayload = {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

const base = "/api/v1/admin/vehicle-incharges";

function clean<T extends Record<string, unknown>>(payload: T): T {
  const next = { ...payload };
  for (const key of Object.keys(next)) {
    if (typeof next[key] === "string" && (next[key] as string).trim() === "") {
      delete next[key];
    }
  }
  return next;
}

export const vehicleInchargeService = {
  list: () =>
    api.get<ApiResponse<PageResponse<VehicleIncharge>>>(base, { params: { size: 100 } }).then((r) => r.data.data),
  create: (payload: VehicleInchargePayload) =>
    api.post<ApiResponse<VehicleIncharge>>(base, clean(payload)).then((r) => r.data.data),
  deactivate: (id: number) => api.patch(`${base}/${id}/deactivate`).then((r) => r.data.data),
};
