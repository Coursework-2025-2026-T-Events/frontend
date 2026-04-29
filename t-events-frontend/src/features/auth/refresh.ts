import { refreshAccessToken } from "@/lib/api/client";
import type { RefreshResponse } from "@/lib/api/types";

export const refreshSession = async () => {
  const accessToken = await refreshAccessToken();
  if (!accessToken) {
    throw new Error("Unable to refresh session");
  }
  return { data: { access_token: accessToken } } satisfies RefreshResponse;
};
