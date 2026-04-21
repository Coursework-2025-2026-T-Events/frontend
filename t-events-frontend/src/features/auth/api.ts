import { api } from "@/lib/api/client";
import type { LoginResponse, RegisterResponse, UserResponse } from "@/lib/api/types";

export const authApi = {
  register: (payload: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post<RegisterResponse>("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", payload),
  me: () => api.get<UserResponse>("/me"),
};