import { api } from "@/services/api";
import type { ApiResponse } from "@/types/api";

export const aiChatService = {
  chat: (message: string, roleHint?: string) =>
    api.post<ApiResponse<{ reply: string }>>("/api/v1/ai/chat", { message, roleHint }).then((r) => r.data.data),
};
