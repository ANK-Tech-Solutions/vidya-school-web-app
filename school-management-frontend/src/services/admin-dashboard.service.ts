import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { DashboardStats } from "@/types/dashboard";
export const adminDashboardService = { getStats: async () => (await api.get<ApiResponse<DashboardStats>>("/api/v1/admin/dashboard/stats")).data.data };
