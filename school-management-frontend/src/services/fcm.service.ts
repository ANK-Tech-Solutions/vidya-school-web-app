import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { FcmTokenRequest } from "@/types/notification";

export const fcmService = {
  registerDriverToken: (token: string) =>
    api.put<ApiResponse<void>>("/api/v1/driver/fcm-token", { token } satisfies FcmTokenRequest),
  registerStudentToken: (token: string) =>
    api.put<ApiResponse<void>>("/api/v1/student/fcm-token", { token } satisfies FcmTokenRequest),
};
