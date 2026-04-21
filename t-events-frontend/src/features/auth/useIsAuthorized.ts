"use client";

import { useAuth } from "./AuthProvider";

export function useIsAuthorized() {
  const { user, isBootstrapping } = useAuth();
  return !isBootstrapping && Boolean(user);
}
