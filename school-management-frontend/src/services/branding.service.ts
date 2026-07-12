import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface Branding { appName: string; appIconUrl: string }

export const brandingService = {
  public: () => api.get<ApiResponse<Branding>>("/api/v1/public/branding").then((r) => r.data.data),
  current: () => api.get<ApiResponse<Branding>>("/api/v1/branding").then((r) => r.data.data),
  update: (payload: Branding) => api.put<ApiResponse<Branding>>("/api/v1/admin/branding", payload).then((r) => r.data.data),
};
