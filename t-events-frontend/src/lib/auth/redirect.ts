import { routes } from "@/lib/routes";

const FALLBACK_AUTH_REDIRECT = routes.events;
export const OAUTH_NEXT_PATH_KEY = "t-events-oauth-next-path";

export function getSafeRedirectPath(value: string | null | undefined): string {
  if (!value) return FALLBACK_AUTH_REDIRECT;
  if (!value.startsWith("/") || value.startsWith("//")) return FALLBACK_AUTH_REDIRECT;
  if (value.startsWith(routes.login) || value.startsWith(routes.register)) return FALLBACK_AUTH_REDIRECT;
  return value;
}

export function buildLoginPath(nextPath: string): string {
  const path = nextPath || FALLBACK_AUTH_REDIRECT;
  return `${routes.login}?next=${encodeURIComponent(path)}`;
}
