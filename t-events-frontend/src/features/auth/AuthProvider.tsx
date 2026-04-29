"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserDTO } from "@/lib/api/types";
import { LOGOUT_INTENT_KEY, tokenStore } from "@/lib/auth/tokenStore";
import { queryKeys } from "@/lib/queryKeys";
import { useParticipationStore } from "@/features/participation/store";
import { refreshSession } from "./refresh";
import { authApi } from "./api";
import {
  AUTH_CHANNEL_NAME,
  AUTH_LOGIN_EVENT_KEY,
  anonymousAuthBootstrap,
  deriveAuthStatus,
  isAuthEvent,
  serializeAuthEvent,
  type AuthEvent,
  type AuthBootstrapResult,
  type AuthStatus,
} from "./authSession";

type AuthContextValue = {
    user: UserDTO | null;
    status: AuthStatus;
    setUser: (user: UserDTO | null) => void;
    logout: () => Promise<void>;
    isBootstrapping: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
function clearClientSession(queryClient: ReturnType<typeof useQueryClient>) {
  tokenStore.set(null);
  useParticipationStore.getState().clear();
  queryClient.setQueryData(queryKeys.auth.bootstrapSession, anonymousAuthBootstrap);
  queryClient.clear();
}

function publishAuthEvent(type: "login" | "logout") {
  const payload = serializeAuthEvent(type);
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.postMessage(JSON.parse(payload));
    channel.close();
  }

  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(type === "login" ? AUTH_LOGIN_EVENT_KEY : LOGOUT_INTENT_KEY, type === "login" ? payload : "1");
  } catch {
    // ignore storage failures in restricted browser modes
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isLogoutInProgress, setIsLogoutInProgress] = useState(false);

  const bootstrapQuery = useQuery({
    queryKey: queryKeys.auth.bootstrapSession,
    queryFn: async () => {
      if (tokenStore.hasLogoutIntent()) {
        tokenStore.set(null);
        return anonymousAuthBootstrap;
      }

      const hadAccessToken = Boolean(tokenStore.get());

      try {
        if (hadAccessToken) {
          const me = await authApi.me();
          return { user: me.data ?? null, sessionExpired: false } satisfies AuthBootstrapResult;
        }
      } catch {
        tokenStore.set(null);
      }

      try {
        const res = await refreshSession();
        tokenStore.setLogoutIntent(false);
        tokenStore.set(res.data.access_token);

        const me = await authApi.me();
        return { user: me.data ?? null, sessionExpired: false } satisfies AuthBootstrapResult;
      } catch {
        tokenStore.set(null);
        return { user: null, sessionExpired: hadAccessToken } satisfies AuthBootstrapResult;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const bootstrap = bootstrapQuery.data ?? anonymousAuthBootstrap;
  const user = bootstrap.user;
  const isBootstrapping = bootstrapQuery.isPending;
  const status = useMemo(
    () =>
      deriveAuthStatus({
        user,
        isBootstrapping,
        isLogoutInProgress,
        hasBootstrapped: bootstrapQuery.isFetched,
        sessionExpired: bootstrap.sessionExpired,
      }),
    [bootstrap.sessionExpired, bootstrapQuery.isFetched, isBootstrapping, isLogoutInProgress, user],
  );

  const setUser = (nextUser: UserDTO | null) => {
    if (nextUser) {
      tokenStore.setLogoutIntent(false);
      publishAuthEvent("login");
    }
    queryClient.setQueryData(queryKeys.auth.bootstrapSession, {
      user: nextUser,
      sessionExpired: false,
    } satisfies AuthBootstrapResult);
  };

  useEffect(() => {
    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(AUTH_CHANNEL_NAME);

    const handleAuthEvent = (event: AuthEvent) => {
      if (event.type === "logout") {
        clearClientSession(queryClient);
        return;
      }

      tokenStore.setLogoutIntent(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.bootstrapSession });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_INTENT_KEY && event.newValue === "1") {
        handleAuthEvent({ type: "logout", timestamp: Date.now() });
        return;
      }
      if (event.key !== AUTH_LOGIN_EVENT_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as unknown;
        if (isAuthEvent(parsed)) handleAuthEvent(parsed);
      } catch {
        // ignore malformed cross-tab auth events
      }
    };

    const handleChannelMessage = (event: MessageEvent) => {
      if (isAuthEvent(event.data)) handleAuthEvent(event.data);
    };

    channel?.addEventListener("message", handleChannelMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      channel?.removeEventListener("message", handleChannelMessage);
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
      publishAuthEvent("logout");
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
