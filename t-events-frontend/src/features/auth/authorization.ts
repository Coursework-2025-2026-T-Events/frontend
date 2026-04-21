import type { UserRole } from "@/lib/api/types";

export function isRoleAllowed(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles) return true;
  return allowedRoles.includes(userRole);
}
