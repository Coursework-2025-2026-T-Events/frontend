import { tokenStore } from "@/lib/auth/tokenStore";

const API_BASE = "/api/v1";
const REFRESH_PATH = "/auth/refresh";
let refreshPromise: Promise<string | null> | null = null;

export type ApiErrorKind = "auth" | "contract" | "http" | "network";

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

function parseRefreshAccessTokenPayload(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("data" in value)) {
    throw new ApiError("Refresh API response does not match the expected contract", 200, "contract_mismatch", value, "contract");
  }

  const data = (value as { data: unknown }).data;
  if (typeof data !== "object" || data === null || !("access_token" in data)) {
    throw new ApiError("Refresh API response does not match the expected contract", 200, "contract_mismatch", value, "contract");
  }

  const accessToken = (data as { access_token: unknown }).access_token;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new ApiError("Refresh API response does not match the expected contract", 200, "contract_mismatch", value, "contract");
  }

  return accessToken;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: unknown;
  public kind: ApiErrorKind;

  constructor(
    message: string,
    status: number,
    code: string = "http_error",
    details: unknown = undefined,
    kind: ApiErrorKind = inferApiErrorKind(status, code),
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.kind = kind;
  }
}

function inferApiErrorKind(status: number, code: string): ApiErrorKind {
  if (code === "network_error" || status === 0) return "network";
  if (code === "contract_mismatch") return "contract";
  if (status === 401 || code === "unauthorized" || code === "session_expired") return "auth";
  return "http";
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  const token = match?.[1];
  return token ? decodeURIComponent(token) : null;
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

export async function refreshAccessToken(): Promise<string | null> {
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

    const rfData = (await rfRes.json()) as unknown;
    const newToken = parseRefreshAccessTokenPayload(rfData);
    tokenStore.set(newToken);
    return newToken;
  } catch (error) {
    if (error instanceof ApiError && error.kind === "contract") throw error;
    return null;
  }
}

async function sendRequest(path: string, options: RequestInit, token: string | null): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: buildHeaders(options, token),
      credentials: "include",
    });
  } catch {
    throw new ApiError("Network request failed", 0, "network_error", undefined, "network");
  }
}

async function readResponseData(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type");
  const text = await res.text();
  if (!contentType?.includes("application/json")) return text;
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (res.ok) {
      throw new ApiError("Invalid JSON response", res.status, "contract_mismatch", undefined, "contract");
    }
    return text;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = tokenStore.get();

  let res = await sendRequest(path, options, token);

  if (res.status === 401 && path !== REFRESH_PATH && !tokenStore.hasLogoutIntent()) {
    token = await refreshAccessToken();

    if (token) {
      res = await sendRequest(path, options, token);
    } else {
      tokenStore.set(null);
    }
  }

  const data = await readResponseData(res);

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

function withJsonBody(options: Omit<RequestInit, "method" | "body">, method: string, body: unknown): RequestInit {
  const jsonBody = toJsonBody(body);
  return jsonBody === undefined ? { ...options, method } : { ...options, method, body: jsonBody };
}

export const api = {
  get: <T>(path: string, options: Omit<RequestInit, "method"> = {}) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options: Omit<RequestInit, "method" | "body"> = {}) =>
    request<T>(path, withJsonBody(options, "POST", body)),
  put: <T>(path: string, body?: unknown, options: Omit<RequestInit, "method" | "body"> = {}) =>
    request<T>(path, withJsonBody(options, "PUT", body)),
  patch: <T>(path: string, body?: unknown, options: Omit<RequestInit, "method" | "body"> = {}) =>
    request<T>(path, withJsonBody(options, "PATCH", body)),
  delete: <T>(path: string, options: Omit<RequestInit, "method"> = {}) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
