import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../lib/authStorage.js";
import { API_ROUTES } from "../constants/index.js";
import { authService } from "./auth.service.js";
import { authEventManager } from "../lib/authEventManager.js";

const getApiUrl = (): string => {
  return (
    (import.meta.env.VITE_API_URL as string) ||
    "https://rimal-backend.vercel.app"
  );
};

const httpClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
});

// ==========================================
// Refresh Queue Implementation
// ==========================================

type QueuedRequest = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
};

let isRefreshing = false;
let refreshSubscribers: QueuedRequest[] = [];

const subscribeToRefresh = (config: InternalAxiosRequestConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject, config });
  });
};

const onRefreshSuccess = (newAccessToken: string) => {
  refreshSubscribers.forEach(({ resolve, config }) => {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${newAccessToken}`;
    }
    resolve(httpClient(config));
  });
  refreshSubscribers = [];
};

const onRefreshFailure = (error: any) => {
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

      // Handle 401 Unauthorized - Attempt Silent Refresh
      if (status === 401 && !originalRequest._retry && !originalRequest._skipRefresh) {
        // If already refreshing, queue the request
        if (isRefreshing) {
          try {
            return await subscribeToRefresh(originalRequest);
          } catch (err) {
            // Refresh failed while waiting, fall through to emit auth event
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
        } catch (refreshError) {
          // Refresh failed - emit auth event instead of navigating
          onRefreshFailure(refreshError);

          // Clear local storage
          authStorage.clear();

          // Emit auth event for AuthContext to handle
          authEventManager.emitSessionExpired(
            refreshError instanceof Error ? refreshError.message : 'Token refresh failed'
          );

          return Promise.reject({
            message: "Session expired. Please log in again.",
            status: 401,
          });
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
