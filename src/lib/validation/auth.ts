import { z } from "zod";

export const roleSchema = z.enum(["host", "seeker"]);

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Adın en az 2 karakter olmalı")
    .max(80, "Ad çok uzun"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta gir"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .max(72, "Şifre çok uzun"),
  role: roleSchema,
  referralCode: z.string().trim().max(20).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta gir"),
  password: z.string().min(1, "Şifre gerekli"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Extracts the lowercase domain from an email address (or null if malformed).
export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain.length ? domain : null;
}
