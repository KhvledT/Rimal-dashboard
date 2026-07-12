/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, UserResponse } from "../services/auth.service.js";
import { authStorage } from "../lib/authStorage.js";
import { authEventManager, AuthEvent } from "../lib/authEventManager.js";
import { useQueryClientContext } from "./QueryClientContext.js";
import type { AuthUser } from "../lib/permissions.js";
import type { LoginInput, SignupInput, VerifyOtpInput, ResendOtpInput } from "../schemas/validation.js";
import { ROUTE_PATHS } from "../constants/index.js";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<{ email: string }>;
  verifyOtp: (data: VerifyOtpInput) => Promise<UserResponse>;
  resendOtp: (data: ResendOtpInput) => Promise<{ email: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { queryClient } = useQueryClientContext();

  // Handle authentication events from httpClient
  useEffect(() => {
    const handleAuthEvent = (_event: AuthEvent) => {
      // Clear authentication state
      authStorage.clear();
      setUser(null);

      // Clear QueryClient cache if available
      if (queryClient) {
        queryClient.clear();
      }

      // Navigate to login
      navigate('/login', { replace: true });
    };

    const unsubscribe = authEventManager.subscribe(handleAuthEvent);

    return () => {
      unsubscribe();
    };
  }, [navigate, queryClient]);

  // Hydrate session from storage on mount
  useEffect(() => {
    const savedUser = authStorage.getUser();
    const token = authStorage.getAccessToken();
    if (savedUser && token) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      authStorage.setAccessToken(response.accessToken);
      authStorage.setRefreshToken(response.refreshToken);
      const authUser: AuthUser = {
        id: response.user.id,
        userName: response.user.userName,
        email: response.user.email,
        role: response.user.role,
      };
      authStorage.setUser(authUser);
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupInput) => {
    return authService.signup(data);
  };

  const verifyOtp = async (data: VerifyOtpInput) => {
    setIsLoading(true);
    try {
      const verifiedUser = await authService.verifySignup(data);
      // Note: verification completes signup, but verified User role remains User (0)
      return verifiedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (data: ResendOtpInput) => {
    return authService.resendOtp(data);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Server-side logout failed, clearing local tokens", error);
    } finally {
      authStorage.clearTokens();
      setUser(null);
      setIsLoading(false);

      // Clear React Query cache via.context
      if (queryClient) {
        queryClient.clear();
      }

      // Navigate to login with replace to prevent browser back button
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
