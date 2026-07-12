import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthContext.js";
import { ROUTE_PATHS } from "../constants/index.js";
import { States } from "./ui/States.js";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * ProtectedRoute - Protects authenticated pages.
 * 
 * Behavior:
 * - If no authenticated session exists: Redirect to Login
 * - If authentication is still being restored (silent refresh): Show fullscreen loading
 * - Do NOT redirect before authentication restoration completes
 * - Does NOT perform role-based checks (use RoleGuard for that)
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while authentication state is being restored
  // This prevents redirect flickering during silent refresh
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <States.LoadingState message="Authenticating session credentials..." />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  // Allow authenticated users to proceed
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
