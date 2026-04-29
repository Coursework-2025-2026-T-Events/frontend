"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "@/lib/api/types";
import { isRoleAllowed } from "./authorization";
import { buildLoginPath } from "@/lib/auth/redirect";
import { routes } from "@/lib/routes";
import LiveStatus from "@/components/ui/LiveStatus";

type RequireAuthProps = {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
};

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const { user, status } = useAuth();
    const router = useRouter();
    const accessDeniedRedirectPath = routes.accessDeniedEvents;
    const isBootstrapping = status === "refreshing" || status === "logout_in_progress";
    const isAuthenticated = status === "authenticated";
    const isRoleAuthorized = useMemo(() => {
        if (!user) return false;
        return isRoleAllowed(user.role, allowedRoles);
    }, [allowedRoles, user]);

    useEffect(() => {
        if (isBootstrapping) return;
        if (!isAuthenticated) {
            const nextPath = `${window.location.pathname}${window.location.search}`;
            router.replace(buildLoginPath(nextPath));
            return;
        }
        if (!isRoleAuthorized) router.replace(accessDeniedRedirectPath);
    }, [accessDeniedRedirectPath, isAuthenticated, isBootstrapping, isRoleAuthorized, router]);

    if (isBootstrapping) {
        return (
            <LiveStatus centered busy>
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[var(--color-brand-yellow)]"></div>
                    <span className="text-sm font-medium text-neutral-600">Проверяем вход...</span>
                </div>
            </LiveStatus>
        );
    }

    if (!isAuthenticated) {
        return (
            <LiveStatus centered>
                <span className="text-sm font-medium text-neutral-600">Перенаправляем на вход...</span>
            </LiveStatus>
        );
    }
    if (!isRoleAuthorized) {
        return (
            <LiveStatus centered>
                <span className="text-sm font-medium text-neutral-600">Перенаправляем в доступный раздел...</span>
            </LiveStatus>
        );
    }

    return <>{children}</>;
}
