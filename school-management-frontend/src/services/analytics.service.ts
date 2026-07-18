import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AnalyticsOverview } from "@/types/analytics";

export const analyticsService = {
  overview: async () =>
    (await api.get<ApiResponse<AnalyticsOverview>>("/api/v1/admin/analytics/overview")).data.data,
};
