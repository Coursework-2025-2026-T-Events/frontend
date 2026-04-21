import { tokenStore } from "@/lib/auth/tokenStore";

const API_BASE = "/api/v1";
const REFRESH_PATH = "/auth/refresh";

let refreshPromise: Promise<string | null> | null = null;

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function shouldAttachJsonContentType(body: BodyInit | null | undefined): boolean {
  if (body === undefined || body === null) return false;
  return !(body instanceof FormData);
}

function buildHeaders(options: RequestInit, token: string | null): Headers {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (shouldAttachJsonContentType(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken && !headers.has("X-CSRF-Token")) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(options, token),
    credentials: "include",
  });

  if (res.status === 401 && path !== REFRESH_PATH) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const rfRes = await fetch(`${API_BASE}${REFRESH_PATH}`, {
            method: "POST",
            headers: buildHeaders({ method: "POST" }, null),
            credentials: "include",
          });
          if (!rfRes.ok) return null;

          const rfData = await rfRes.json();
          const newToken = rfData?.data?.access_token;
          if (typeof newToken === "string" && newToken.length > 0) {
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
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: buildHeaders(options, newToken),
        credentials: "include",
      });
    } else {
      tokenStore.set(null);
    }
  }

  let data: unknown;
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
    throw (data as { error?: unknown })?.error ?? {
      code: "http_error",
      message: typeof data === "string" ? data : "Unknown error",
      status: res.status,
    };
  }
  return data as T;
}

function toJsonBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  return JSON.stringify(body);
}

export const api = {
  get: <T>(path: string, options: Omit<RequestInit, "method"> = {}) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options: Omit<RequestInit, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "POST", body: toJsonBody(body) }),
  put: <T>(path: string, body?: unknown, options: Omit<RequestInit, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "PUT", body: toJsonBody(body) }),
  patch: <T>(path: string, body?: unknown, options: Omit<RequestInit, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "PATCH", body: toJsonBody(body) }),
  delete: <T>(path: string, options: Omit<RequestInit, "method"> = {}) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
