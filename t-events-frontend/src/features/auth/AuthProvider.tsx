"use client";

import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserDTO } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/tokenStore";
import { refreshSession } from "./refresh";
import { authApi } from "./api";

type AuthContextValue = {
    user: UserDTO | null;
    setUser: (user: UserDTO | null) => void;
    logout: () => Promise<void>;
    isBootstrapping: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const bootstrapQuery = useQuery({
        queryKey: ["auth", "bootstrap-session"],
        queryFn: async () => {
            try {
                const res = await refreshSession();
                tokenStore.set(res.data.access_token);
                return res.data.user;
            } catch {
                tokenStore.set(null);
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!bootstrapQuery.isError) return;
        tokenStore.set(null);
    }, [bootstrapQuery.isError]);

    const user = bootstrapQuery.data ?? null;
    const isBootstrapping = bootstrapQuery.isPending;

    const setUser = (nextUser: UserDTO | null) => {
        queryClient.setQueryData(["auth", "bootstrap-session"], nextUser);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // ignore logout endpoint errors on client side
        }
        tokenStore.set(null);
        queryClient.setQueryData(["auth", "bootstrap-session"], null);
        queryClient.clear(); // Optionally clear all caches on logout
    };

    const value = useMemo(
        () => ({ user, setUser, logout, isBootstrapping }),
        [user, isBootstrapping, setUser, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}