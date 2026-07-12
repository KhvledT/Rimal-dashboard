import axios from "axios";
import httpClient from "./httpClient.js";
import { API_ROUTES } from "../constants/index.js";

export interface CorporateProfile {
  previewUrl: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  updatedAt: string;
}

export interface SignedUploadResponse {
  uploadUrl: string;
  storageKey: string;
}

export const profileService = {
  async getProfile(): Promise<CorporateProfile> {
    return httpClient.get(API_ROUTES.CORPORATE_PROFILE.BASE);
  },

  async getUploadUrl(): Promise<SignedUploadResponse> {
    return httpClient.get(API_ROUTES.CORPORATE_PROFILE.UPLOAD_URL);
  },

  // Perform a raw binary PUT upload directly to the pre-signed URL (e.g. Supabase Storage bucket)
  async uploadBinary(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type || "application/pdf",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress?.(percent);
        }
      },
    });
  },

  async updateMetadata(data: {
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    size: number;
  }): Promise<CorporateProfile> {
    return httpClient.put(API_ROUTES.CORPORATE_PROFILE.BASE, data);
  },

  async deleteProfile(): Promise<void> {
    return httpClient.delete(API_ROUTES.CORPORATE_PROFILE.BASE);
  },

  getDownloadUrl(): string {
    const baseURL = httpClient.defaults.baseURL || "";
    return `${baseURL}${API_ROUTES.CORPORATE_PROFILE.DOWNLOAD}`;
  },
};
