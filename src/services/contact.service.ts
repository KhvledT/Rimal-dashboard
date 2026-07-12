import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface MessagesResponse {
  data: ContactMessage[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const contactService = {
  async getMessages(page = 1, limit = 10): Promise<MessagesResponse> {
    return httpClient.get(`${API_ROUTES.CONTACT_MESSAGES.BASE}?page=${page}&limit=${limit}`);
  },

  async deleteMessage(id: string): Promise<void> {
    return httpClient.delete(API_ROUTES.CONTACT_MESSAGES.BY_ID(id));
  },
};
