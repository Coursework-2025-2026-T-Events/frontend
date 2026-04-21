import { api } from "@/lib/api/client";
import type { LoginResponse } from "@/lib/api/types";

// TODO: заменить на фактический endpoint, когда появится
// ожидаемый контракт: { data: { access_token, user } }
export const refreshSession = async () => {
  return api.post<LoginResponse>("/auth/refresh");
};