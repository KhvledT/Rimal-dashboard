import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./providers/AuthContext.js";
import { QueryClientProviderWrapper } from "./providers/QueryClientContext.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { PublicRoute } from "./components/PublicRoute.js";
import { RoleGuard } from "./components/RoleGuard.js";
import { DashboardLayout } from "./components/DashboardLayout.js";
import { ROUTE_PATHS } from "./constants/index.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { EnvValidator } from "./components/EnvValidator.js";

// Lazy loading views
const Login = React.lazy(() => import("./pages/Login.js"));
const AccessDenied = React.lazy(() => import("./pages/AccessDenied.js"));
const DashboardHome = React.lazy(() => import("./pages/DashboardHome.js"));
const TeamPage = React.lazy(() => import("./pages/TeamPage.js"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage.js"));
const ContactInfoPage = React.lazy(() => import("./pages/ContactInfoPage.js"));
const MessagesPage = React.lazy(() => import("./pages/MessagesPage.js"));
const AdminPage = React.lazy(() => import("./pages/AdminPage.js"));
const AuditLogsPage = React.lazy(() => import("./pages/AuditLogsPage.js"));
const HealthPage = React.lazy(() => import("./pages/HealthPage.js"));

// Centralized TanStack Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // retry once
      refetchOnWindowFocus: false, // disable focus refetching globally
      refetchOnReconnect: true, // refetch on network reconnect
    },
  },
});

export const App = () => {
  return (
    <ErrorBoundary>
      <EnvValidator />
      <QueryClientProvider client={queryClient}>
        <QueryClientProviderWrapper queryClient={queryClient}>
          <BrowserRouter>
            <AuthProvider>
            {/* Global Branded Toaster notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: "Open Sans, sans-serif",
                  fontSize: "12.5px",
                  borderRadius: "0.375rem",
                  borderWidth: "1px",
                },
                classNames: {
                  success: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
                  error: "bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]",
                  warning: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
                },
              }}
            />
            
            <React.Suspense
              fallback={
                <div className="min-h-screen bg-sand flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-burgundy"></div>
                </div>
              }
            >
              <Routes>
                {/* Public Routes - Guest Only */}
                <Route element={<PublicRoute />}>
                  <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
                </Route>

                {/* Protected Routes - Authentication Required */}
                <Route element={<ProtectedRoute />}>
                  {/* Access Denied - Available to all authenticated users */}
                  <Route path={ROUTE_PATHS.ACCESS_DENIED} element={<AccessDenied />} />

                  {/* Dashboard Layout with Role-based protection */}
                  <Route element={<DashboardLayout />}>
                    {/* Role-based protected routes - Admin/Super Admin only */}
                    <Route element={<RoleGuard requireAdmin />}>
                      <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardHome />} />
                      <Route path={ROUTE_PATHS.TEAM} element={<TeamPage />} />
                      <Route path={ROUTE_PATHS.PROFILE} element={<ProfilePage />} />
                      <Route path={ROUTE_PATHS.CONTACT_INFO} element={<ContactInfoPage />} />
                      <Route path={ROUTE_PATHS.MESSAGES} element={<MessagesPage />} />
                      <Route path={ROUTE_PATHS.AUDIT_LOGS} element={<AuditLogsPage />} />
                      <Route path={ROUTE_PATHS.HEALTH} element={<HealthPage />} />
                    </Route>

                    {/* Super Admin only routes */}
                    <Route element={<RoleGuard requireSuperAdmin />}>
                      <Route path={ROUTE_PATHS.ADMIN} element={<AdminPage />} />
                    </Route>
                  </Route>
                </Route>

                {/* Catch-all fallback - redirect based on auth state */}
                <Route path="*" element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />
              </Routes>
            </React.Suspense>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProviderWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
