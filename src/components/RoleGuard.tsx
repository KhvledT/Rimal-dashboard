import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthContext.js";
import { permissions } from "../lib/permissions.js";
import { ROUTE_PATHS } from "../constants/index.js";

interface RoleGuardProps {
  requireSuperAdmin?: boolean;
  requireAdmin?: boolean;
  children?: React.ReactNode;
}

/**
 * RoleGuard - Protects role-specific pages.
 * 
 * Behavior:
 * - If user lacks required permission: Redirect to Access Denied
 * - Never renders unauthorized content even briefly
 */
export const RoleGuard = ({ 
  requireSuperAdmin = false, 
  requireAdmin = false,
  children 
}: RoleGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while authentication state is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-burgundy"></div>
      </div>
    );
  }

  // Must be authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  // Check Super Admin requirement
  if (requireSuperAdmin && !permissions.isSuperAdmin(user)) {
    return <Navigate to={ROUTE_PATHS.ACCESS_DENIED} replace />;
  }

  // Check Admin requirement (includes Super Admin)
  if (requireAdmin && !permissions.hasDashboardAccess(user)) {
    return <Navigate to={ROUTE_PATHS.ACCESS_DENIED} replace />;
  }

  // User has required permissions
  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;
