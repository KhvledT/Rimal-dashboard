import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService, TeamMember } from "../services/team.service.js";
import { profileService, CorporateProfile } from "../services/profile.service.js";
import { contactInfoService, ContactInfo } from "../services/contactInfo.service.js";
import { contactService, MessagesResponse } from "../services/contact.service.js";
import { adminService } from "../services/admin.service.js";
import { healthService, HealthStatus } from "../services/health.service.js";
import { QUERY_KEYS } from "../constants/index.js";
import type { UserResponse } from "../services/auth.service.js";

// ==========================================
// Team Member Query & Mutation Hooks
// ==========================================

export const useTeamQuery = () => {
  return useQuery<TeamMember[], Error>({
    queryKey: [QUERY_KEYS.TEAM],
    queryFn: teamService.getTeam,
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation<TeamMember, Error, FormData>({
    mutationFn: teamService.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
    },
  });
};

export const useUpdateTeamMember = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<TeamMember, Error, FormData>({
    mutationFn: (formData) => teamService.updateMember(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: teamService.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
    },
  });
};

// ==========================================
// Corporate Profile Query & Mutation Hooks
// ==========================================

export const useProfileQuery = () => {
  return useQuery<CorporateProfile, Error>({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: profileService.getProfile,
    retry: 1, // retry once if not uploaded yet
  });
};

export const useUploadProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<CorporateProfile, Error, { file: File; onProgress?: (percent: number) => void }>({
    mutationFn: async ({ file, onProgress }) => {
      // 1. Retrieve the pre-signed upload URL and storage key from backend
      const { uploadUrl, storageKey } = await profileService.getUploadUrl();
      // 2. Perform direct binary file PUT upload to storage provider (Supabase / AWS) with real progress
      await profileService.uploadBinary(uploadUrl, file, onProgress);
      // 3. Confirm profile upload and update metadata record in MongoDB database
      const updatedProfile = await profileService.updateMetadata({
        storageKey,
        originalFilename: file.name,
        mimeType: file.type || "application/pdf",
        size: file.size,
      });
      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: profileService.deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    },
  });
};

// ==========================================
// Contact Information Hooks
// ==========================================

export const useContactInfoQuery = () => {
  return useQuery<ContactInfo, Error>({
    queryKey: [QUERY_KEYS.CONTACT_INFO],
    queryFn: contactInfoService.getContactInfo,
  });
};

export const useUpdateContactInfo = () => {
  const queryClient = useQueryClient();
  return useMutation<ContactInfo, Error, ContactInfo>({
    mutationFn: contactInfoService.updateContactInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACT_INFO] });
    },
  });
};

// ==========================================
// Contact Messages (Inquiries) Hooks
// ==========================================

export const useContactMessagesQuery = (page: number, limit: number) => {
  return useQuery<MessagesResponse, Error>({
    queryKey: [QUERY_KEYS.MESSAGES, page, limit],
    queryFn: () => contactService.getMessages(page, limit),
  });
};

export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: contactService.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MESSAGES] });
    },
  });
};

// ==========================================
// Admin Management (Super Admin Only) Hooks
// ==========================================

export const useUsersQuery = (enabled = false) => {
  return useQuery<UserResponse[], Error>({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: adminService.getUsers,
    enabled,
  });
};

export const useAdminsQuery = (enabled = false) => {
  return useQuery<UserResponse[], Error>({
    queryKey: [QUERY_KEYS.ADMINS],
    queryFn: adminService.getAdmins,
    enabled,
  });
};

export const usePromoteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, string>({
    mutationFn: adminService.promoteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMINS] });
    },
  });
};

export const useDemoteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, string>({
    mutationFn: adminService.demoteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMINS] });
    },
  });
};

// ==========================================
// Health Checks Hooks (Polling Disabled)
// ==========================================

export const useHealthQuery = () => {
  return useQuery<HealthStatus, Error>({
    queryKey: [QUERY_KEYS.HEALTH],
    queryFn: healthService.checkHealth,
    refetchInterval: false, // Do not continuously poll
    refetchOnWindowFocus: false, // Disable focus-refetching
    staleTime: Infinity, // Avoid background refetching, rely strictly on manual refreshes
  });
};
