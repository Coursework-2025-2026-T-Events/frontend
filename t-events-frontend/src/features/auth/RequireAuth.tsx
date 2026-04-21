"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "@/lib/api/types";
import { isRoleAllowed } from "./authorization";

type RequireAuthProps = {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
};

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const { user, isBootstrapping } = useAuth();
    const router = useRouter();
    const accessDeniedRedirectPath = "/events?accessDenied=1";
    const isAuthenticated = !!user;
    const isRoleAuthorized = useMemo(() => {
        if (!user) return false;
        return isRoleAllowed(user.role, allowedRoles);
    }, [allowedRoles, user]);

    useEffect(() => {
        if (isBootstrapping) return;
        if (!isAuthenticated) {
            router.replace("/auth/login");
            return;
        }
        if (!isRoleAuthorized) router.replace(accessDeniedRedirectPath);
    }, [accessDeniedRedirectPath, isAuthenticated, isBootstrapping, isRoleAuthorized, router]);

    if (isBootstrapping) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[var(--color-brand-yellow)]"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (!isRoleAuthorized) return null;

    return <>{children}</>;
}
