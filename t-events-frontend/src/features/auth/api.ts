import { api } from "@/lib/api/client";
import type { LoginResponse, RegisterResponse, UserResponse } from "@/lib/api/types";

export const authApi = {
  register: (payload: { email: string; password: string; full_name: string; phone: string }) =>
    api.post<RegisterResponse>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", payload),
  vkStartPath: "/api/v1/auth/vk/start",
  vkCallback: (params: { code: string; state: string; device_id?: string }) => {
    const searchParams = new URLSearchParams(params);
    return api.get<LoginResponse>(`/auth/vk/callback?${searchParams.toString()}`);
  },
  me: () => api.get<UserResponse>("/me"),
};
