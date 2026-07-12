import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAuth } from "../providers/AuthContext.js";
import { permissions } from "../lib/permissions.js";
import { ROUTE_PATHS } from "../constants/index.js";
import { cn } from "../lib/utils.js";
import type { AuthUser } from "../lib/permissions.js";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  /** Opens the logout confirmation dialog (owned by DashboardLayout) */
  onLogout: () => void;
  /** The currently authenticated user, used to render identity in footer */
  user: AuthUser | null;
}

export const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, onLogout, user }: SidebarProps) => {
  const location = useLocation();
  const { user: contextUser } = useAuth();
  const isSuperAdmin = permissions.isSuperAdmin(user ?? contextUser);

  const menuGroups = [
    {
      title: "System",
      items: [
        {
          label: "System Status",
          path: ROUTE_PATHS.DASHBOARD,
          icon: (
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
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          ),
        },
        {
          label: "System Health",
          path: ROUTE_PATHS.HEALTH,
          icon: (
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
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Directory",
      items: [
        {
          label: "Team Directory",
          path: ROUTE_PATHS.TEAM,
          icon: (
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20c-2.197 0-4.253-.62-6.002-1.701L4 18c0-2.317 3.125-4.125 7-4.125 1.157 0 2.26.16 3.242.457m0 0a4.122 4.122 0 0 1 2.138 2.617M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6.303 3.376a3.375 3.375 0 1 1-4.043-4.043 3.61 3.61 0 0 1 4.043 4.043Z"
              />
            </svg>
          ),
        },
        {
          label: "Corporate Profile",
          path: ROUTE_PATHS.PROFILE,
          icon: (
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          ),
        },
        {
          label: "Contact Details",
          path: ROUTE_PATHS.CONTACT_INFO,
          icon: (
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
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          label: "Visitor Inquiries",
          path: ROUTE_PATHS.MESSAGES,
          icon: (
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          ),
        },
        ...(isSuperAdmin
          ? [
              {
                label: "Admin Controls",
                path: ROUTE_PATHS.ADMIN,
                icon: (
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
                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                    />
                  </svg>
                ),
              },
            ]
          : []),
        {
          label: "Audit Logs",
          path: ROUTE_PATHS.AUDIT_LOGS,
          icon: (
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
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const isLinkActive = (path: string): boolean => {
    if (path === ROUTE_PATHS.DASHBOARD) {
      return location.pathname === ROUTE_PATHS.DASHBOARD;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out md:translate-x-0 select-none flex flex-col justify-between",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Branding header container */}
          <div className="h-16 px-6 border-b border-sidebar-border flex items-center gap-3 flex-shrink-0">
            <img 
              src="/Logo.webp" 
              alt="Rimal Logo" 
              className="h-8 w-auto object-contain"
            />
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <span className="font-bold text-sm tracking-wider block leading-none font-serif text-white">
                  RIMAL
                </span>
                <span className="text-[10px] text-gold tracking-widest uppercase font-semibold">
                  Admin Panel
                </span>
              </div>
            )}
          </div>

          {/* Navigation Groups List */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-4">
            <Tooltip.Provider delayDuration={150}>
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  {!isCollapsed ? (
                    <h4 className="text-[10px] text-gold tracking-widest font-bold uppercase px-3 mb-1 opacity-70">
                      {group.title}
                    </h4>
                  ) : (
                    <div className="h-px bg-sidebar-border my-2 mx-2 opacity-50" />
                  )}

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isLinkActive(item.path);
                      const linkContent = (
                        <Link
                          to={item.path}
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all relative group focus:outline-none focus:ring-1 focus:ring-gold",
                            active
                              ? "bg-sidebar-primary text-white shadow-md border-l-2 border-gold"
                              : "text-gray-300 hover:bg-sidebar-accent hover:text-white"
                          )}
                        >
                          <span
                            className={cn(
                              "transition-transform duration-250 group-hover:scale-110",
                              active ? "text-gold" : "text-gray-400"
                            )}
                          >
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <span className="animate-in fade-in duration-200">{item.label}</span>
                          )}
                        </Link>
                      );

                      if (isCollapsed) {
                        return (
                          <Tooltip.Root key={item.path}>
                            <Tooltip.Trigger asChild>{linkContent}</Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                side="right"
                                sideOffset={12}
                                className="bg-navy-deep text-white text-[11px] font-semibold font-body tracking-wide px-3 py-1.5 rounded border border-sidebar-border shadow-lg z-50 animate-in fade-in slide-in-from-left-2 duration-150"
                              >
                                {item.label}
                                <Tooltip.Arrow className="fill-navy-deep" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        );
                      }

                      return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
                    })}
                  </div>
                </div>
              ))}
            </Tooltip.Provider>
          </nav>
        </div>

        {/* Sidebar Footer: User Identity + Logout + Collapse Toggle */}
        <div className="flex flex-col flex-shrink-0 bg-navy-deep/60">

          {/* User identity strip with logout button */}
          <div className="border-t border-sidebar-border">
            <Tooltip.Provider delayDuration={150}>
              {isCollapsed ? (
                /* Collapsed: show initials avatar + logout icon, no text */
                <div className="flex flex-col items-center gap-2 py-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white font-bold text-xs border border-gold/30 flex-shrink-0">
                    {user
                      ? user.userName.substring(0, 2).toUpperCase()
                      : "?"}
                  </div>
                  {/* Logout icon with tooltip */}
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={onLogout}
                        className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-sidebar-accent transition focus:outline-none focus:ring-1 focus:ring-red-400"
                        aria-label="Sign out"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                          />
                        </svg>
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        sideOffset={12}
                        className="bg-navy-deep text-white text-[11px] font-semibold font-body tracking-wide px-3 py-1.5 rounded border border-sidebar-border shadow-lg z-50 animate-in fade-in slide-in-from-left-2 duration-150"
                      >
                        Sign Out
                        <Tooltip.Arrow className="fill-navy-deep" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              ) : (
                /* Expanded: full user card with name, role badge, and logout button */
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-white font-bold text-xs border border-gold/30 flex-shrink-0">
                    {user
                      ? user.userName.substring(0, 2).toUpperCase()
                      : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate leading-none">
                      {user?.userName ?? "—"}
                    </p>
                    <p className="text-[9px] text-gold uppercase tracking-widest font-semibold mt-0.5">
                      {user?.role === 2
                        ? "Super Admin"
                        : user?.role === 1
                          ? "Admin"
                          : "User"}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-sidebar-accent transition focus:outline-none focus:ring-1 focus:ring-red-400 flex-shrink-0"
                    title="Sign Out"
                    aria-label="Sign out of dashboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-4 h-4"
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
            </Tooltip.Provider>
          </div>

          {/* Collapse toggle */}
          <div className="p-3 border-t border-sidebar-border flex items-center justify-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 p-2 rounded text-xs font-semibold text-gray-300 hover:bg-sidebar-accent hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-gold"
              title={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {isCollapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span className="text-[11px] tracking-wide uppercase font-semibold">Collapse Sidepanel</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 border-t border-sidebar-border text-[9px] text-gray-500 text-center font-body bg-navy-deep">
            {!isCollapsed ? "Version 1.0.2 \u00A9 2026 Rimal Group" : "v1.0.2"}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
