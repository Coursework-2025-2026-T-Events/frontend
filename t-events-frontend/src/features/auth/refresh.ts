import { api } from "@/lib/api/client";
import type { RefreshResponse } from "@/lib/api/types";

export const refreshSession = async () => {
  return api.post<RefreshResponse>("/auth/refresh", undefined);
};
