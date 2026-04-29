import { api } from "@/lib/api/client";
import type { LoginResponse, LogoutResponse, RegisterResponse, UserResponse } from "@/lib/api/types";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN ?? "";
const vkStartPath = `${backendOrigin}/api/v1/auth/vk/start`;
const apiBase = "/api/v1";

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  const token = match?.[1];
  return token ? decodeURIComponent(token) : null;
}

async function logout(accessToken: string | null): Promise<LogoutResponse | null> {
  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const res = await fetch(`${apiBase}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers,
  });

  if (!res.ok) return null;
  return (await res.json()) as LogoutResponse;
}

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
  logout,
  me: () => api.get<UserResponse>("/me"),
};
