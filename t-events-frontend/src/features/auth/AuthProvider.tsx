"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
    const [userOverride, setUserOverride] = useState<UserDTO | null | undefined>(undefined);

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

    const user = userOverride ?? bootstrapQuery.data ?? null;
    const isBootstrapping = userOverride === undefined && bootstrapQuery.isPending;

    const setUser = (nextUser: UserDTO | null) => {
        setUserOverride(nextUser);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // ignore logout endpoint errors on client side
        }
        tokenStore.set(null);
        setUserOverride(null);
    };

    const value = useMemo(
        () => ({ user, setUser, logout, isBootstrapping }),
        [user, isBootstrapping]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
