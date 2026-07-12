import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../lib/authStorage.js";
import { API_ROUTES } from "../constants/index.js";
import { authService } from "./auth.service.js";
import { authEventManager } from "../lib/authEventManager.js";

const getApiUrl = (): string => {
  return (import.meta.env.VITE_API_URL as string) || "";
};

const httpClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
});

// ==========================================
// Refresh Request Normalization & Matcher
// ==========================================
const isRefreshTokenRoute = (url: string | undefined): boolean => {
  if (!url) return false;

  let pathname = url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      pathname = new URL(url).pathname;
    } catch {
      // Ignore URL parsing errors and keep path as is
    }
  }

  const normalizedPath = pathname.split("?")[0];
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;

  return cleanPath === API_ROUTES.AUTH.REFRESH_TOKEN;
};

// ==========================================
// Refresh Queue Implementation
// ==========================================

type QueuedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
};

let isRefreshing = false;
let refreshSubscribers: QueuedRequest[] = [];

const subscribeToRefresh = (config: InternalAxiosRequestConfig): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject, config });
  });
};

const onRefreshSuccess = (newAccessToken: string) => {
  refreshSubscribers.forEach(({ resolve, config }) => {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${newAccessToken}`;
    }
    // Set _retry to true on queued requests to prevent loop if retried request fails
    (config as any)._retry = true;
    resolve(httpClient(config));
  });
  refreshSubscribers = [];
};

const onRefreshFailure = (error: unknown) => {
  refreshSubscribers.forEach(({ reject }) => {
    reject(error);
  });
  refreshSubscribers = [];
};

// ==========================================
// Request Interceptor
// ==========================================

httpClient.interceptors.request.use(
  (config) => {
    // Skip authorization header for public endpoints
    const publicEndpoints = [
      API_ROUTES.AUTH.SIGNUP,
      API_ROUTES.AUTH.VERIFY_SIGNUP,
      API_ROUTES.AUTH.RESEND_OTP,
      API_ROUTES.AUTH.LOGIN,
      API_ROUTES.AUTH.REFRESH_TOKEN,
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = authStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================================
// Response Interceptor with Silent Refresh
// ==========================================

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unpack standard backend wrapper: { message: string, result: any }
    if (response.data && response.data.result !== undefined) {
      return response.data.result;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _skipRefresh?: boolean;
    };

    const normalizedError = {
      message: "An unexpected error occurred. Please try again.",
      status: error.response?.status,
    };

    // Handle network errors (no response from server)
    if (!error.response && error.request) {
      normalizedError.message =
        "Unable to connect to the server. Please check your network connection.";
      // Do NOT logout on network errors - preserve session
      return Promise.reject(normalizedError);
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string };

      // Extract specific backend error message if available
      const backendMessage = data?.message || data?.error;
      const isRefreshRequest = isRefreshTokenRoute(originalRequest.url);

      // Handle 401 Unauthorized - Attempt Silent Refresh
      if (status === 401 && !originalRequest._retry && !originalRequest._skipRefresh && !isRefreshRequest) {
        // If already refreshing, queue the request
        if (isRefreshing) {
          try {
            return await subscribeToRefresh(originalRequest);
          } catch (queueError) {
            return Promise.reject(queueError);
          }
        }

        // Mark as refreshing to prevent multiple refresh attempts
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = authStorage.getRefreshToken();

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Attempt to refresh tokens
          const response = await authService.refreshTokens(refreshToken);

          // Save new tokens
          authStorage.updateTokens(response.accessToken, response.refreshToken);

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          }

          // Resolve all queued requests with new token
          onRefreshSuccess(response.accessToken);

          // Retry the original request
          return httpClient(originalRequest);
        } catch (refreshError: any) {
          // Perform cleanup in precise order:
          // 1. Stop refreshing
          isRefreshing = false;

          // 2. & 3. Reject every queued request & Empty refreshSubscribers
          onRefreshFailure(refreshError);

          // Check if this is a network/connectivity error (status is undefined)
          // or a temporary server error (e.g. 500, 502, 503, 504)
          // We only logout on auth validation failures (400, 401, 403)
          const isAuthError = refreshError?.status === 400 || refreshError?.status === 401 || refreshError?.status === 403;

          if (isAuthError) {
            // 4. Clear authentication storage
            authStorage.clear();

            // 5. Emit session expired event
            authEventManager.emitSessionExpired(
              refreshError instanceof Error ? refreshError.message : 'Token refresh failed'
            );

            return Promise.reject({
              message: "Session expired. Please log in again.",
              status: 401,
            });
          } else {
            // Return network/server error normally without logging out
            return Promise.reject(refreshError);
          }
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error statuses
      if (status === 401) {
        normalizedError.message =
          backendMessage || "Session expired. Please log in again.";
        // Skip refresh for this request (already tried or marked to skip)
        // Emit auth event instead of navigating
        authStorage.clear();
        authEventManager.emitUnauthorized(backendMessage);
      } else if (status === 403) {
        normalizedError.message =
          backendMessage ||
          "Access denied. You do not have permission for this action.";
      } else if (status === 429) {
        normalizedError.message = "Too many attempts. Please try again later.";
      } else if (status === 500) {
        normalizedError.message =
          "Internal Server Error. Please contact support.";
      } else {
        normalizedError.message = backendMessage || normalizedError.message;
      }
    }

    return Promise.reject(normalizedError);
  },
);

export default httpClient;
export { httpClient };
