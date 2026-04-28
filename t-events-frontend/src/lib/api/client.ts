import { tokenStore } from "@/lib/auth/tokenStore";

const API_BASE = "/api/v1";
const REFRESH_PATH = "/auth/refresh";
let refreshPromise: Promise<string | null> | null = null;

type ApiEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  data?: {
    access_token?: string;
  };
};

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: unknown;

  constructor(message: string, status: number, code: string = "http_error", details: unknown = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function shouldAttachJsonContentType(body: BodyInit | null | undefined): boolean {
  if (body === undefined || body === null) return false;
  // Exclude types that the browser sets Content-Type for automatically
  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer || body instanceof URLSearchParams) {
    return false;
  }
  return true;
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

async function executeRefresh(): Promise<string | null> {
  if (tokenStore.hasLogoutIntent()) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = executeRefreshRequest().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function executeRefreshRequest(): Promise<string | null> {
  try {
    const rfRes = await fetch(`${API_BASE}${REFRESH_PATH}`, {
      method: "POST",
      headers: buildHeaders({ method: "POST" }, null),
      credentials: "include",
    });
    if (!rfRes.ok) return null;

    const rfData = (await rfRes.json()) as ApiEnvelope;
    const newToken = rfData?.data?.access_token;
    if (typeof newToken === "string" && newToken.length > 0) {
      tokenStore.set(newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = tokenStore.get();

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(options, token),
    credentials: "include",
  });

  if (res.status === 401 && path !== REFRESH_PATH && !tokenStore.hasLogoutIntent()) {
    token = await executeRefresh();

    if (token) {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: buildHeaders(options, token),
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
    const responseData = typeof data === "object" && data !== null ? (data as ApiEnvelope) : null;
    const errorMsg =
      responseData?.error?.message || (typeof data === "string" && data.trim() ? data : "Unknown API Error");
    const errorCode = responseData?.error?.code || "http_error";
    const details = responseData?.error?.details;
    throw new ApiError(errorMsg, res.status, errorCode, details);
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
