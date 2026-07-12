import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  photo?: string;
  description: string;
  expertise: string[];
  linkedin: string;
}

export const teamService = {
  async getTeam(): Promise<TeamMember[]> {
    return httpClient.get(API_ROUTES.TEAM.BASE);
  },

  async createMember(formData: FormData): Promise<TeamMember> {
    return httpClient.post(API_ROUTES.TEAM.BASE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async updateMember(id: string, formData: FormData): Promise<TeamMember> {
    return httpClient.put(API_ROUTES.TEAM.BY_ID(id), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async deleteMember(id: string): Promise<void> {
    return httpClient.delete(API_ROUTES.TEAM.BY_ID(id));
  },
};
