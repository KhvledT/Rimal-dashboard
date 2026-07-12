export const ROUTE_PATHS = {
  LOGIN: "/login",
  ACCESS_DENIED: "/access-denied",
  DASHBOARD: "/",
  TEAM: "/team",
  PROFILE: "/profile",
  CONTACT_INFO: "/contact-info",
  MESSAGES: "/messages",
  ADMIN: "/admin",
  AUDIT_LOGS: "/audit-logs",
  HEALTH: "/health",
};

export const QUERY_KEYS = {
  TEAM: "team",
  PROFILE: "profile",
  CONTACT_INFO: "contactInfo",
  MESSAGES: "messages",
  USERS: "users",
  ADMINS: "admins",
  HEALTH: "health",
};

export const API_ROUTES = {
  AUTH: {
    SIGNUP: "/auth/signup",
    VERIFY_SIGNUP: "/auth/verify-signup",
    RESEND_OTP: "/auth/resend-signup-otp",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  TEAM: {
    BASE: "/team",
    BY_ID: (id: string) => `/team/${id}`,
  },
  CONTACT_INFO: {
    BASE: "/contact-info",
  },
  CORPORATE_PROFILE: {
    BASE: "/corporate-profile",
    DOWNLOAD: "/corporate-profile/download",
    UPLOAD_URL: "/corporate-profile/upload-url",
  },
  CONTACT_MESSAGES: {
    BASE: "/contact",
    BY_ID: (id: string) => `/contact/${id}`,
  },
  ADMIN: {
    USERS: "/admin/users",
    ADMINS: "/admin/admins",
    PROMOTE: (id: string) => `/admin/promote/${id}`,
    DEMOTE: (id: string) => `/admin/demote/${id}`,
  },
  HEALTH: {
    BASE: "/health",
  },
};
