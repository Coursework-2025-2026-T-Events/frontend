import { api } from "@/lib/api/client";
import type { LoginResponse, RegisterResponse, UserResponse } from "@/lib/api/types";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN ?? "";
const vkStartPath = `${backendOrigin}/api/v1/auth/vk/start`;

export const authApi = {
  register: (payload: { email: string; password: string; full_name: string; phone: string }) =>
    api.post<RegisterResponse>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", payload),
  vkStartPath,
  vkCallback: (params: { code: string; state: string; device_id?: string }) => {
    const searchParams = new URLSearchParams(params);
    return api.get<LoginResponse>(`/auth/vk/callback?${searchParams.toString()}`);
  },
  me: () => api.get<UserResponse>("/me"),
};
