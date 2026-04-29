import type { UserDTO } from "@/lib/api/types";

export const AUTH_CHANNEL_NAME = "t-events-auth";
export const AUTH_LOGIN_EVENT_KEY = "t-events-login-event";

export type AuthStatus = "unknown" | "refreshing" | "anonymous" | "authenticated" | "expired" | "logout_in_progress";

export type AuthEvent = {
  type: "login" | "logout";
  timestamp: number;
};

export type AuthBootstrapResult = {
  user: UserDTO | null;
  sessionExpired: boolean;
};

type AuthStatusInput = {
  user: UserDTO | null;
  isBootstrapping: boolean;
  isLogoutInProgress: boolean;
  hasBootstrapped: boolean;
  sessionExpired: boolean;
};

export const anonymousAuthBootstrap: AuthBootstrapResult = {
  user: null,
  sessionExpired: false,
};

export function deriveAuthStatus({
  user,
  isBootstrapping,
  isLogoutInProgress,
  hasBootstrapped,
  sessionExpired,
}: AuthStatusInput): AuthStatus {
  if (isLogoutInProgress) return "logout_in_progress";
  if (!hasBootstrapped && !isBootstrapping) return "unknown";
  if (isBootstrapping) return "refreshing";
  if (user) return "authenticated";
  if (sessionExpired) return "expired";
  return "anonymous";
}

export function isAuthEvent(value: unknown): value is AuthEvent {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Partial<AuthEvent>;
  return (event.type === "login" || event.type === "logout") && typeof event.timestamp === "number";
}

export function serializeAuthEvent(type: AuthEvent["type"]): string {
  return JSON.stringify({ type, timestamp: Date.now() } satisfies AuthEvent);
}
