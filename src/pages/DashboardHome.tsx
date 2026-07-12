import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthContext.js";
import { permissions } from "../lib/permissions.js";
import { ROUTE_PATHS } from "../constants/index.js";
import {
  useTeamQuery,
  useContactMessagesQuery,
  useProfileQuery,
  useUsersQuery,
  useAdminsQuery,
  useHealthQuery,
} from "../hooks/index.js";

export const DashboardHome = () => {
  const { user } = useAuth();
  const isSuperAdmin = permissions.isSuperAdmin(user);

  // Fetch real queries for metrics
  const { data: team, isLoading: teamLoading } = useTeamQuery();
  const { data: messages, isLoading: messagesLoading } = useContactMessagesQuery(1, 1);
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const { data: users, isLoading: usersLoading } = useUsersQuery(isSuperAdmin);
  const { data: admins, isLoading: adminsLoading } = useAdminsQuery(isSuperAdmin);
  const { data: health, isLoading: healthLoading } = useHealthQuery();

  const getRoleLabel = (role: number) => {
    if (role === 2) return "Super Admin";
    if (role === 1) return "Admin";
    return "User";
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 md:space-y-8 select-none font-body">
      {/* Welcome Banner */}
      <div className="bg-white rounded border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-navy leading-none mb-1">
            Welcome back, {user?.userName}
          </h2>
          <p className="text-xs text-gray-500 font-body mt-1.5">
            You are logged in with role level:{" "}
            <span className="font-semibold text-gold uppercase tracking-wider">
              {getRoleLabel(user?.role || 0)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
          <Link
            to={ROUTE_PATHS.CONTACT_INFO}
            className="bg-gold hover:bg-gold-light px-4 py-2 rounded shadow transition"
          >
            Edit Contact Details
          </Link>
          <Link
            to={ROUTE_PATHS.TEAM}
            className="bg-burgundy hover:bg-burgundy-deep px-4 py-2 rounded shadow transition"
          >
            Manage Team
          </Link>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Team Directory Count */}
        <div className="bg-white rounded border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
              Active Team size
            </p>
            <h3 className="text-2xl font-bold text-navy leading-none">
              {teamLoading ? (
                <div className="h-7 w-12 bg-sand animate-pulse rounded"></div>
              ) : (
                team?.length || 0
              )}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2 font-body">
              <Link to={ROUTE_PATHS.TEAM} className="text-gold hover:underline">
                View team directory &rarr;
              </Link>
            </p>
          </div>
          <div className="w-12 h-12 bg-sand text-gold rounded-full flex items-center justify-center">
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20c-2.197 0-4.253-.62-6.002-1.701L4 18c0-2.317 3.125-4.125 7-4.125 1.157 0 2.26.16 3.242.457m0 0a4.122 4.122 0 0 1 2.138 2.617M15 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6.303 3.376a3.375 3.375 0 1 1-4.043-4.043 3.61 3.61 0 0 1 4.043 4.043Z"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: Contact Messages Inquiries */}
        <div className="bg-white rounded border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
              Contact Inquiries
            </p>
            <h3 className="text-2xl font-bold text-navy leading-none">
              {messagesLoading ? (
                <div className="h-7 w-12 bg-sand animate-pulse rounded"></div>
              ) : (
                messages?.totalItems || 0
              )}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2 font-body">
              <Link to={ROUTE_PATHS.MESSAGES} className="text-gold hover:underline">
                Read visitors messages &rarr;
              </Link>
            </p>
          </div>
          <div className="w-12 h-12 bg-sand text-gold rounded-full flex items-center justify-center">
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: Corporate Profile PDF status */}
        <div className="bg-white rounded border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
              Corporate Profile PDF
            </p>
            <h3 className="text-sm font-bold text-navy truncate max-w-[150px] leading-tight">
              {profileLoading ? (
                <div className="h-5 w-20 bg-sand animate-pulse rounded"></div>
              ) : profile ? (
                `PDF (${formatBytes(profile.size)})`
              ) : (
                "Not uploaded"
              )}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2 font-body">
              <Link to={ROUTE_PATHS.PROFILE} className="text-gold hover:underline">
                Upload or edit file &rarr;
              </Link>
            </p>
          </div>
          <div className="w-12 h-12 bg-sand text-gold rounded-full flex items-center justify-center">
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
        </div>

        {/* Metric 4: Health Indicator Status */}
        <div className="bg-white rounded border border-border p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
              System Health
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block ${
                  healthLoading
                    ? "bg-gray-300 animate-pulse"
                    : health?.status === "UP"
                    ? "bg-green-500 animate-ping"
                    : "bg-red-500"
                }`}
              ></span>
              <h3 className="text-base font-bold text-navy uppercase leading-none">
                {healthLoading ? "Checking..." : health?.status || "DOWN"}
              </h3>
            </div>
            <p className="text-[10px] text-gray-500 mt-2.5 font-body">
              <Link to={ROUTE_PATHS.HEALTH} className="text-gold hover:underline">
                View metrics report &rarr;
              </Link>
            </p>
          </div>
          <div className="w-12 h-12 bg-sand text-gold rounded-full flex items-center justify-center">
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Super Admin User Panel Teaser */}
      {isSuperAdmin && (
        <div className="bg-white rounded border border-border p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-navy uppercase tracking-wider mb-4">
            Security Promotion Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-sand border border-border rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Registered Normal Users
                </span>
                <span className="text-xl font-bold text-navy">
                  {usersLoading ? "..." : users?.length || 0}
                </span>
              </div>
              <Link
                to={ROUTE_PATHS.ADMIN}
                className="text-[10px] font-semibold text-gold uppercase hover:underline"
              >
                Manage &rarr;
              </Link>
            </div>

            <div className="p-4 bg-sand border border-border rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Active Panel Admins
                </span>
                <span className="text-xl font-bold text-navy">
                  {adminsLoading ? "..." : admins?.length || 0}
                </span>
              </div>
              <Link
                to={ROUTE_PATHS.ADMIN}
                className="text-[10px] font-semibold text-gold uppercase hover:underline"
              >
                Manage &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
