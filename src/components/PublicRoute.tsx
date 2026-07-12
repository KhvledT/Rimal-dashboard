import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthContext.js";
import { permissions } from "../lib/permissions.js";
import { ROUTE_PATHS } from "../constants/index.js";

interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * PublicRoute - Protects pages that should only be accessible to guests.
 * 
 * Behavior:
 * - If NOT authenticated: Allow access
 * - If authenticated:
 *   - Admin/Super Admin: Redirect to Dashboard
 *   - User: Redirect to Access Denied
 * 
 * Uses replace navigation to prevent browser back button from returning to public routes
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while authentication state is being restored
  // This prevents redirect flickering during silent refresh
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-burgundy"></div>
      </div>
    );
  }

  // If authenticated, redirect based on role
  if (isAuthenticated && user) {
    // Admin and Super Admin go to Dashboard
    if (permissions.hasDashboardAccess(user)) {
      return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
    }
    // Regular User goes to Access Denied
    return <Navigate to={ROUTE_PATHS.ACCESS_DENIED} replace />;
  }

  // Guest access allowed
  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
