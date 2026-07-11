import { api } from "@/services/api"; import type { ApiResponse } from "@/types/api"; import type { PageResponse } from "@/types/common"; import type { BroadcastNotificationRequest, Notification } from "@/types/notification";
export const notificationService = { list: async (params?: Record<string, unknown>) => (await api.get<ApiResponse<PageResponse<Notification>>>("/api/v1/admin/notifications", { params })).data.data };
export const adminNotificationService = {
  broadcast: async (request: BroadcastNotificationRequest) => (await api.post<ApiResponse<Notification>>("/api/v1/admin/notifications/broadcast", request)).data.data,
};
