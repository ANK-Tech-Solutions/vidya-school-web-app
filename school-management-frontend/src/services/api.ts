import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original?._retry || original?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return Promise.reject(error);
    original._retry = true;
    try {
      refreshPromise ??= axios
        .post<ApiResponse<AuthResponse>>(`${API_URL}/api/v1/auth/refresh`, { refreshToken })
        .then((response) => {
          const auth = response.data.data;
          useAuthStore.getState().setAuth(auth);
          return auth.accessToken;
        })
        .finally(() => { refreshPromise = null; });
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);
