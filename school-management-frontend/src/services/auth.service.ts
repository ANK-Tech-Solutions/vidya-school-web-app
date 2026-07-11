import { api } from "./api";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse, LoginPayload } from "@/types/auth";
import type { User } from "@/types/user";

export const authService = {
  login: async (payload: LoginPayload) => (await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/login", payload)).data.data,
  refresh: async (refreshToken: string) => (await api.post<ApiResponse<AuthResponse>>("/api/v1/auth/refresh", { refreshToken })).data.data,
  logout: async (refreshToken: string) => api.post("/api/v1/auth/logout", { refreshToken }),
  me: async () => (await api.get<ApiResponse<User>>("/api/v1/auth/me")).data.data,
};
