"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserDTO } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/tokenStore";
import { useParticipationStore } from "@/features/participation/store";
import { refreshSession } from "./refresh";
import { authApi } from "./api";

type AuthContextValue = {
    user: UserDTO | null;
    setUser: (user: UserDTO | null) => void;
    logout: () => Promise<void>;
    isBootstrapping: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const LOGOUT_INTENT_KEY = "t-events-logout-intent";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const bootstrapQuery = useQuery({
    queryKey: ["auth", "bootstrap-session"],
    queryFn: async () => {
      if (tokenStore.hasLogoutIntent()) {
        tokenStore.set(null);
        return null;
      }

      try {
        if (tokenStore.get()) {
          const me = await authApi.me();
          return me.data ?? null;
        }

        const res = await refreshSession();
        tokenStore.setLogoutIntent(false);
        tokenStore.set(res.data.access_token);

        const me = await authApi.me();
        return me.data ?? null;
      } catch {
        tokenStore.set(null);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const user = bootstrapQuery.data ?? null;
  const isBootstrapping = bootstrapQuery.isPending;

  const setUser = (nextUser: UserDTO | null) => {
    queryClient.setQueryData(["auth", "bootstrap-session"], nextUser);
  };

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOGOUT_INTENT_KEY || event.newValue !== "1") return;
      tokenStore.set(null);
      useParticipationStore.getState().clear();
      queryClient.setQueryData(["auth", "bootstrap-session"], null);
      queryClient.clear();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [queryClient]);

  const logout = async () => {
    tokenStore.setLogoutIntent(true);
    tokenStore.set(null);
    useParticipationStore.getState().clear();
    queryClient.setQueryData(["auth", "bootstrap-session"], null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isBootstrapping }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
