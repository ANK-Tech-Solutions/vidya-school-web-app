import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";

export type PlatformSchool = {
  id: number;
  code: string;
  name: string;
  appName?: string;
  appIconUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  active: boolean;
};

export type PlatformSchoolPayload = {
  code: string;
  name: string;
  appName?: string;
  appIconUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  active?: boolean;
};

export type PlatformAdmin = {
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

export type PlatformAdminPayload = {
  schoolId: number;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

const base = "/api/v1/platform";

function clean<T extends Record<string, unknown>>(payload: T): T {
  const next = { ...payload };
  for (const key of Object.keys(next)) {
    if (typeof next[key] === "string" && (next[key] as string).trim() === "") {
      delete next[key];
    }
  }
  return next;
}

export const platformService = {
  listSchools: () =>
    api.get<ApiResponse<PageResponse<PlatformSchool>>>(`${base}/schools`, { params: { size: 100 } }).then((r) => r.data.data),
  createSchool: (payload: PlatformSchoolPayload) =>
    api.post<ApiResponse<PlatformSchool>>(`${base}/schools`, clean(payload)).then((r) => r.data.data),
  updateSchool: (id: number, payload: PlatformSchoolPayload) =>
    api.put<ApiResponse<PlatformSchool>>(`${base}/schools/${id}`, clean(payload)).then((r) => r.data.data),
  deactivateSchool: (id: number) => api.patch(`${base}/schools/${id}/deactivate`).then((r) => r.data.data),

  listAdmins: () =>
    api.get<ApiResponse<PageResponse<PlatformAdmin>>>(`${base}/admins`, { params: { size: 100 } }).then((r) => r.data.data),
  createAdmin: (payload: PlatformAdminPayload) =>
    api.post<ApiResponse<PlatformAdmin>>(`${base}/admins`, clean(payload)).then((r) => r.data.data),
  deactivateAdmin: (id: number) => api.patch(`${base}/admins/${id}/deactivate`).then((r) => r.data.data),
};
