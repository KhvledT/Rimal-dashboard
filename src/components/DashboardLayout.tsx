import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar.js";
import { useAuth } from "../providers/AuthContext.js";
import { ROUTE_PATHS } from "../constants/index.js";
import { cn } from "../lib/utils.js";
import Logo from "../../public/Logo.webp";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("rimal_sidebar_collapsed") === "true";
  });
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("rimal_sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      // logout() in AuthContext calls backend, then clears tokens + user state
      // regardless of API success/failure (already handles 401 gracefully)
      await logout();
      // Clear the entire React Query cache so stale protected data is not accessible
      queryClient.clear();
      toast.success("You have been signed out successfully.");
      // Use replace so pressing Back cannot return to a protected page
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
    } catch (error) {
      // logout() swallows API errors internally; this catches anything unexpected
      console.error("Logout error", error);
      // Still clear local state and redirect — never leave user stuck
      queryClient.clear();
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutOpen(false);
    }
  };

  // Compute breadcrumbs path
  type BreadcrumbItem = { label: string; path?: string; active: boolean };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split("/").filter(Boolean);
    if (paths.length === 0) return [{ label: "Dashboard Home", active: true }];

    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", path: ROUTE_PATHS.DASHBOARD, active: false },
    ];

    paths.forEach((p, idx) => {
      const path = `/${paths.slice(0, idx + 1).join("/")}`;
      const isLast = idx === paths.length - 1;
      const formattedLabel = p
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (isLast) {
        breadcrumbs.push({
          label: formattedLabel,
          active: isLast,
        });
      } else {
        breadcrumbs.push({
          label: formattedLabel,
          path,
          active: isLast,
        });
      }
    });

    return breadcrumbs;
  };

  const getRoleLabel = (role: number) => {
    if (role === 2) return "Super Admin";
    if (role === 1) return "Admin";
    return "User";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col font-body">
      {/* Logout Confirmation Modal — rendered at top level to be outside sidebar */}
      {isLogoutOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div className="bg-white rounded border border-border shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
              </div>
              <div>
                <h2
                  id="logout-dialog-title"
                  className="text-sm font-bold text-navy uppercase tracking-wider"
                >
                  Confirm Sign Out
                </h2>
                <p className="text-[11px] text-gray-500 font-body mt-0.5">
                  Your active session will be terminated.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-body leading-relaxed border-t border-border pt-4">
              Are you sure you want to sign out? Any unsaved changes will be
              lost and you will need to log in again to access the dashboard.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setIsLogoutOpen(false)}
                className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600 hover:text-navy bg-sand hover:bg-sand/80 rounded border border-border transition focus:outline-none focus:ring-1 focus:ring-burgundy disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogoutConfirm}
                className="relative px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded border border-red-700 shadow transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed min-w-[90px]"
              >
                {isLoggingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing out...
                  </span>
                ) : (
                  "Sign Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar navigation panel */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        onLogout={() => setIsLogoutOpen(true)}
        user={user}
      />

      {/* Main page content container */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:pl-20" : "md:pl-64",
        )}
      >
        {/* Header row */}
        <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-sm">
          {/* Hamburger toggle trigger & Breadcrumbs wrapper */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-sand text-navy rounded md:hidden focus:outline-none"
              title="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Logo */}
            <img
              src={Logo}
              alt="Rimal Logo"
              className="h-8 w-auto object-contain hidden md:block"
            />

            {/* Breadcrumbs List navigation */}
            <nav className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
              {getBreadcrumbs().map((bc, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-400">/</span>}
                  {bc.active || bc.path === undefined ? (
                    <span className="font-semibold text-navy">{bc.label}</span>
                  ) : (
                    <Link to={bc.path!} className="hover:text-gold transition">
                      {bc.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* User profile dropdown drawer slot */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right hidden xs:flex">
                <span className="text-xs font-semibold text-navy leading-none">
                  {user.userName}
                </span>
                <span className="text-[9px] font-semibold text-gold uppercase mt-0.5 tracking-wider">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-burgundy text-white flex items-center justify-center font-bold text-xs shadow-sm border border-border">
                {getInitials(user.userName)}
              </div>

              {/* Logout quick click trigger — opens confirmation dialog */}
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="text-gray-400 hover:text-red-600 rounded transition p-1.5 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-400"
                title="Sign Out"
                aria-label="Sign out of dashboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          )}
        </header>

        {/* Dynamic page sub-views outlet portal */}
        <main className="p-6 md:p-8 flex-1 flex flex-col min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
