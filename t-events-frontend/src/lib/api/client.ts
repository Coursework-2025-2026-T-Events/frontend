import { tokenStore } from "@/lib/auth/tokenStore";

const API_BASE = "/api/v1";

// Сохраняем промис рефреша, чтобы параллельные запросы ждали один и тот же токен
let refreshPromise: Promise<string | null> | null = null;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include", 
  });

  // Если словили 401 и это не сам запрос на рефреш
  if (res.status === 401 && !path.includes("/auth/refresh")) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const rfRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!rfRes.ok) return null;
          
          const rfData = await rfRes.json();
          const newToken = rfData?.data?.access_token;
          if (newToken) {
            tokenStore.set(newToken);
            return newToken;
          }
          return null;
        } catch {
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Повторяем упавший запрос с новым токеном
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
        credentials: "include",
      });
    } else {
      // Рефреш лопнул - разлогиниваем
      tokenStore.set(null);
    }
  }

  let data;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw data?.error ?? { code: "http_error", message: typeof data === "string" ? data : "Unknown error", status: res.status };
  }
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
};