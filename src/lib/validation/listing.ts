import { z } from "zod";

import { LISTING_FEATURES, MAX_LISTING_PHOTOS, MIN_LISTING_PHOTOS } from "@/lib/constants";

const featureValues = LISTING_FEATURES.map((f) => f.value) as [string, ...string[]];

export const listingFormSchema = z.object({
  title: z.string().trim().min(8, "Başlık en az 8 karakter olmalı").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  monthlyRent: z.coerce
    .number({ message: "Kira tutarı gir" })
    .int()
    .min(500, "Kira çok düşük görünüyor")
    .max(200000, "Kira çok yüksek görünüyor"),
  deposit: z.coerce.number().int().min(0).max(500000).optional(),
  billsIncluded: z.boolean().default(false),
  roomCount: z.coerce.number().int().min(1).max(10).default(1),
  totalRooms: z.coerce.number().int().min(1).max(20).optional(),
  flatmatesCount: z.coerce.number().int().min(0).max(20).optional(),
  availableFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih seç")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().min(1, "Şehir seç"),
  district: z.string().trim().min(1, "İlçe seç"),
  neighborhood: z.string().trim().max(80).optional().or(z.literal("")),
  petsAllowed: z.boolean().default(false),
  furnished: z.boolean().default(false),
  genderPreference: z.enum(["any", "female", "male"]).default("any"),
  features: z.array(z.enum(featureValues)).default([]),
});

export type ListingInput = z.infer<typeof listingFormSchema>;

// Photo count is validated separately because uploads are handled client-side.
export function validatePhotoCount(count: number): string | null {
  if (count < MIN_LISTING_PHOTOS)
    return `En az ${MIN_LISTING_PHOTOS} fotoğraf yüklemelisin`;
  if (count > MAX_LISTING_PHOTOS)
    return `En fazla ${MAX_LISTING_PHOTOS} fotoğraf yükleyebilirsin`;
  return null;
}

// Filters for the listing list view (kept in the URL via nuqs).
export const listingFiltersSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  minRent: z.number().optional(),
  maxRent: z.number().optional(),
  rooms: z.number().optional(),
  pets: z.boolean().optional(),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;
