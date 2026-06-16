import { z } from "zod";

import { roleSchema } from "@/lib/validation/auth";

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Adın en az 2 karakter olmalı").max(80),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  graduationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih seç")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Tanıtım metni en fazla 500 karakter")
    .optional()
    .or(z.literal("")),
  role: roleSchema,
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileFormSchema>;

// Onboarding: a map of questionId -> selected option value.
export const onboardingAnswersSchema = z
  .record(z.string(), z.number().int().min(1).max(10))
  .refine((obj) => Object.keys(obj).length === 15, {
    message: "Tüm soruları yanıtla",
  });

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;
