import type { UserRole } from "@/lib/types/database.types";

export const ROLE_LABELS: Record<UserRole, string> = {
  host: "Ev Sunan",
  seeker: "Ev Arayan",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  host: "Boş odan/evin var, ev arkadaşı arıyorsun.",
  seeker: "Kalacak bir oda/ev ve uyumlu bir ev arkadaşı arıyorsun.",
};

// Selectable amenities for a listing (stored in listings.features).
export const LISTING_FEATURES: { value: string; label: string }[] = [
  { value: "internet", label: "İnternet" },
  { value: "washing_machine", label: "Çamaşır Makinesi" },
  { value: "dishwasher", label: "Bulaşık Makinesi" },
  { value: "refrigerator", label: "Buzdolabı" },
  { value: "oven", label: "Fırın" },
  { value: "stove", label: "Ocak" },
  { value: "balcony", label: "Balkon" },
  { value: "elevator", label: "Asansör" },
  { value: "parking", label: "Otopark" },
  { value: "heating_central", label: "Merkezi Isıtma" },
  { value: "heating_combi", label: "Kombi" },
  { value: "air_conditioning", label: "Klima" },
  { value: "private_bathroom", label: "Özel Banyo" },
  { value: "near_campus", label: "Kampüse Yakın" },
  { value: "near_metro", label: "Metroya Yakın" },
];

// İlan fotoğrafı kategorileri (hepsi zorunlu — her birine en az 1 foto).
export const PHOTO_CATEGORIES = [
  { key: "room", label: "Kalınacak oda" },
  { key: "bathroom", label: "Banyo / Tuvalet" },
  { key: "kitchen", label: "Mutfak" },
  { key: "common", label: "Ortak alan" },
] as const;

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number]["key"];

export const PHOTO_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PHOTO_CATEGORIES.map((c) => [c.key, c.label]),
);

// İlan kapatma sebepleri.
export const CLOSE_REASONS = [
  { value: "matched", label: "Eşleşme tamamlandı" },
  { value: "found_elsewhere", label: "Başka yerde buldum" },
  { value: "gave_up", label: "Vazgeçtim" },
  { value: "other", label: "Diğer" },
] as const;

export const CLOSE_REASON_LABELS: Record<string, string> = Object.fromEntries(
  CLOSE_REASONS.map((r) => [r.value, r.label]),
);

// İlan listesi sıralama seçenekleri.
export const SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen" },
  { value: "compatibility", label: "Uyum (yüksek)" },
  { value: "newest", label: "En yeni" },
  { value: "rent_asc", label: "Kira (artan)" },
  { value: "rent_desc", label: "Kira (azalan)" },
  { value: "available", label: "Müsait kişi (çok)" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const FEATURE_LABELS: Record<string, string> = Object.fromEntries(
  LISTING_FEATURES.map((f) => [f.value, f.label]),
);

export const GENDER_PREFERENCE_OPTIONS = [
  { value: "any", label: "Farketmez" },
  { value: "female", label: "Kadın" },
  { value: "male", label: "Erkek" },
] as const;

export const GENDER_PREFERENCE_LABELS: Record<string, string> = Object.fromEntries(
  GENDER_PREFERENCE_OPTIONS.map((o) => [o.value, o.label]),
);

export const MIN_LISTING_PHOTOS = 3;
export const MAX_LISTING_PHOTOS = 10;
export const LISTING_DURATION_DAYS = 30;
