"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { UserDTO } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/tokenStore";
import { refreshSession } from "./refresh";

type AuthContextValue = {
    user: UserDTO | null;
    setUser: (user: UserDTO | null) => void;
    logout: () => void;
    isBootstrapping: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const isMounted = React.useRef(false); // Защита от StrictMode

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        // Попытка восстановить сессию при старте
        (async () => {
            try {
                const res = await refreshSession();
                tokenStore.set(res.data.access_token);
                setUser(res.data.user);
            } catch {
                // refresh не удался — остаёмся гостем
                tokenStore.set(null);
                setUser(null);
            } finally {
                setIsBootstrapping(false);
            }
        })();
    }, []);

    const logout = () => {
        tokenStore.set(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({ user, setUser, logout, isBootstrapping }),
        [user, isBootstrapping]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used внутри AuthProvider");
    return ctx;
}