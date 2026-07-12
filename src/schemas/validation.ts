import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP verification code must be exactly 6 digits"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const resendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  expertise: z.array(z.string()).min(1, "At least one expertise tag is required"),
  linkedin: z.string().url("Invalid LinkedIn URL").or(z.literal("")),
});

export const contactInfoSchema = z.object({
  address: z.string().min(1, "Address is required"),
  emails: z.array(z.string().email("Invalid email address")).min(1, "At least one email is required"),
  phones: z.array(z.string().min(5, "Invalid phone number")).min(1, "At least one phone number is required"),
  linkedIn: z.string().url("Invalid LinkedIn URL").or(z.literal("")),
  mapUrl: z.string().url("Invalid Google Maps Embed URL").or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
