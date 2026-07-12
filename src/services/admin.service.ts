import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";
import type { UserResponse } from "./auth.service.js";

export const adminService = {
  async getUsers(): Promise<UserResponse[]> {
    return httpClient.get(API_ROUTES.ADMIN.USERS);
  },

  async getAdmins(): Promise<UserResponse[]> {
    return httpClient.get(API_ROUTES.ADMIN.ADMINS);
  },

  async promoteUser(id: string): Promise<UserResponse> {
    return httpClient.patch(API_ROUTES.ADMIN.PROMOTE(id));
  },

  async demoteAdmin(id: string): Promise<UserResponse> {
    return httpClient.patch(API_ROUTES.ADMIN.DEMOTE(id));
  },
};
