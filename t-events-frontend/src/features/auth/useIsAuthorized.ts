"use client";

import { useAuth } from "./AuthProvider";

export function useIsAuthorized() {
  const { status } = useAuth();
  return status === "authenticated";
}
