import { z } from "zod";

import {
  LISTING_FEATURES,
  MAX_LISTING_PHOTOS,
  MIN_LISTING_PHOTOS,
  PHOTO_CATEGORIES,
} from "@/lib/constants";

const featureValues = LISTING_FEATURES.map((f) => f.value) as [string, ...string[]];

export const listingFormSchema = z
  .object({
    title: z.string().trim().min(8, "Başlık en az 8 karakter olmalı").max(120),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    monthlyRent: z.coerce
      .number({ message: "Kira tutarı gir" })
      .int()
      .min(500, "Kira çok düşük görünüyor")
      .max(200000, "Kira çok yüksek görünüyor"),
    deposit: z.coerce.number().int().min(0).max(500000).optional(),
    dues: z.coerce.number().int().min(0).max(50000).optional(),
    billsIncluded: z.boolean().default(false),
    capacity: z.coerce.number().int().min(1, "Kapasite en az 1").max(20),
    occupied: z.coerce.number().int().min(0).max(20).default(0),
    totalRooms: z.coerce.number().int().min(1).max(20).optional(),
    bathroomCount: z.coerce.number().int().min(0).max(10).optional(),
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
  })
  .refine((d) => d.occupied <= d.capacity, {
    message: "Dolu kişi sayısı kapasiteden fazla olamaz",
    path: ["occupied"],
  });

export type ListingInput = z.infer<typeof listingFormSchema>;

// Kategorili fotoğraflar: her kategoride en az 1, toplam MIN..MAX arası.
export function validateCategorizedPhotos(
  photos: { category: string }[],
): string | null {
  if (photos.length < MIN_LISTING_PHOTOS)
    return `En az ${MIN_LISTING_PHOTOS} fotoğraf yüklemelisin`;
  if (photos.length > MAX_LISTING_PHOTOS)
    return `En fazla ${MAX_LISTING_PHOTOS} fotoğraf yükleyebilirsin`;
  for (const c of PHOTO_CATEGORIES) {
    if (!photos.some((p) => p.category === c.key)) {
      return `${c.label} için en az 1 fotoğraf gerekli`;
    }
  }
  return null;
}

// Filters for the listing list view (kept in the URL via nuqs).
export const listingFiltersSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  minRent: z.number().optional(),
  maxRent: z.number().optional(),
  minAvailable: z.number().optional(),
  pets: z.boolean().optional(),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;
