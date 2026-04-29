"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserDTO } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/tokenStore";
import { queryKeys } from "@/lib/queryKeys";
import { useParticipationStore } from "@/features/participation/store";
import { refreshSession } from "./refresh";
import { authApi } from "./api";

type AuthContextValue = {
    user: UserDTO | null;
    status: AuthStatus;
    setUser: (user: UserDTO | null) => void;
    logout: () => Promise<void>;
    isBootstrapping: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const LOGOUT_INTENT_KEY = "t-events-logout-intent";
const AUTH_CHANNEL_NAME = "t-events-auth";

export type AuthStatus = "refreshing" | "anonymous" | "authenticated" | "logout_in_progress";

function clearClientSession(queryClient: ReturnType<typeof useQueryClient>) {
  tokenStore.set(null);
  useParticipationStore.getState().clear();
  queryClient.setQueryData(queryKeys.auth.bootstrapSession, null);
  queryClient.clear();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isLogoutInProgress, setIsLogoutInProgress] = useState(false);

  const bootstrapQuery = useQuery({
    queryKey: queryKeys.auth.bootstrapSession,
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
  const status: AuthStatus = useMemo(() => {
    if (isLogoutInProgress) return "logout_in_progress";
    if (isBootstrapping) return "refreshing";
    return user ? "authenticated" : "anonymous";
  }, [isBootstrapping, isLogoutInProgress, user]);

  const setUser = (nextUser: UserDTO | null) => {
    if (nextUser) tokenStore.setLogoutIntent(false);
    queryClient.setQueryData(queryKeys.auth.bootstrapSession, nextUser);
  };

  useEffect(() => {
    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(AUTH_CHANNEL_NAME);

    const handleLogoutSignal = () => {
      clearClientSession(queryClient);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LOGOUT_INTENT_KEY || event.newValue !== "1") return;
      handleLogoutSignal();
    };

    channel?.addEventListener("message", handleLogoutSignal);
    window.addEventListener("storage", handleStorage);
    return () => {
      channel?.removeEventListener("message", handleLogoutSignal);
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [queryClient]);

  const logout = async () => {
    const accessToken = tokenStore.get();
    tokenStore.setLogoutIntent(true);
    setIsLogoutInProgress(true);
    try {
      await authApi.logout(accessToken);
    } finally {
      clearClientSession(queryClient);
      setIsLogoutInProgress(false);
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type: "logout" });
        channel.close();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, status, setUser, logout, isBootstrapping }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
