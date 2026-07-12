import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";
import type { LoginInput, SignupInput, VerifyOtpInput, ResendOtpInput } from "../schemas/validation.js";

export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  role: number;
  phone?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async signup(data: SignupInput): Promise<{ email: string }> {
    return httpClient.post(API_ROUTES.AUTH.SIGNUP, data);
  },

  async verifySignup(data: VerifyOtpInput): Promise<UserResponse> {
    return httpClient.post(API_ROUTES.AUTH.VERIFY_SIGNUP, data);
  },

  async resendOtp(data: ResendOtpInput): Promise<{ email: string }> {
    return httpClient.post(API_ROUTES.AUTH.RESEND_OTP, data);
  },

  async login(data: LoginInput): Promise<LoginResponse> {
    return httpClient.post(API_ROUTES.AUTH.LOGIN, data);
  },

  async logout(): Promise<void> {
    return httpClient.post(API_ROUTES.AUTH.LOGOUT);
  },

  async refreshTokens(refreshToken: string): Promise<RefreshTokenResponse> {
    return httpClient.post(API_ROUTES.AUTH.REFRESH_TOKEN, { refreshToken });
  },
};
