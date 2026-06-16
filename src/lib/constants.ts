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
