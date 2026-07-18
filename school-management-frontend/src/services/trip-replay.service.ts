import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { PageResponse } from "@/types/common";
import type { InchargeTripRow, TripReplay } from "@/types/trip-replay";

export const tripReplayService = {
  recentTrips: async (params?: { from?: string; to?: string; page?: number; size?: number }) =>
    (await api.get<ApiResponse<PageResponse<InchargeTripRow>>>("/api/v1/incharge/reports/trips", { params })).data.data,
  replay: async (tripId: number) =>
    (await api.get<ApiResponse<TripReplay>>(`/api/v1/incharge/trips/${tripId}/replay`)).data.data,
};
