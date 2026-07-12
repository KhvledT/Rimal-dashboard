import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";

export interface ContactInfo {
  address: string;
  emails: string[];
  phones: string[];
  linkedIn: string;
  mapUrl: string;
}

export const contactInfoService = {
  async getContactInfo(): Promise<ContactInfo> {
    return httpClient.get(API_ROUTES.CONTACT_INFO.BASE);
  },

  async updateContactInfo(data: ContactInfo): Promise<ContactInfo> {
    return httpClient.put(API_ROUTES.CONTACT_INFO.BASE, data);
  },
};
