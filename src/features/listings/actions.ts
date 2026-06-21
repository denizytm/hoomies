"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import type { ListingStatus } from "@/lib/types/database.types";
import {
  listingFormSchema,
  validateCategorizedPhotos,
} from "@/lib/validation/listing";

type CategorizedPhoto = { path: string; category: string };

export type ListingState = { error?: string } | null;

function optNum(v: FormDataEntryValue | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function createListingAction(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  let photos: CategorizedPhoto[] = [];
  try {
    photos = JSON.parse((formData.get("photos") as string) || "[]");
  } catch {
    return { error: "Form verisi okunamadı." };
  }
  const features = formData.getAll("features").map(String);

  const photoErr = validateCategorizedPhotos(photos);
  if (photoErr) return { error: photoErr };

  const parsed = listingFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    monthlyRent: formData.get("monthlyRent"),
    deposit: optNum(formData.get("deposit")),
    dues: optNum(formData.get("dues")),
    billsIncluded: formData.get("billsIncluded") === "true",
    capacity: formData.get("capacity"),
    occupied: formData.get("occupied") ?? 0,
    totalRooms: optNum(formData.get("totalRooms")),
    bathroomCount: optNum(formData.get("bathroomCount")),
    availableFrom: formData.get("availableFrom") ?? "",
    city: formData.get("city"),
    district: formData.get("district"),
    neighborhood: formData.get("neighborhood") ?? "",
    petsAllowed: formData.get("petsAllowed") === "true",
    furnished: formData.get("furnished") === "true",
    genderPreference: formData.get("genderPreference") ?? "any",
    features,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form geçersiz" };
  }

  const { supabase, user } = await requireUser();
  const d = parsed.data;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title: d.title,
      description: d.description || null,
      monthly_rent: d.monthlyRent,
      deposit: d.deposit ?? null,
      dues: d.dues ?? null,
      bills_included: d.billsIncluded,
      capacity: d.capacity,
      occupied: d.occupied,
      room_count: d.totalRooms ?? 1,
      total_rooms: d.totalRooms ?? null,
      bathroom_count: d.bathroomCount ?? null,
      available_from: d.availableFrom || null,
      city: d.city,
      district: d.district,
      neighborhood: d.neighborhood || null,
      pets_allowed: d.petsAllowed,
      furnished: d.furnished,
      gender_preference: d.genderPreference,
      features: d.features,
    })
    .select("id")
    .single();

  if (error || !listing) {
    return { error: error?.message ?? "İlan oluşturulamadı." };
  }

  const photoRows = photos.map((p, i) => ({
    listing_id: listing.id,
    storage_path: p.path,
    category: p.category,
    position: i,
  }));
  const { error: photoError } = await supabase.from("listing_photos").insert(photoRows);
  if (photoError) return { error: photoError.message };

  redirect(`/listings/${listing.id}`);
}

// İlanı 30 gün uzat (yenile) — süresi dolmuş/pasif ilanı tekrar aktif eder.
export async function extendListingAction(formData: FormData) {
  const id = formData.get("id") as string;
  const { supabase, user } = await requireUser();
  const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
  await supabase
    .from("listings")
    .update({ expires_at: expiresAt, status: "active" })
    .eq("id", id)
    .eq("owner_id", user.id);
  revalidatePath("/listings/mine");
}

// Eşleşme sonrası / elle ilanı kapat — sebebiyle birlikte.
export async function closeListingAction(formData: FormData) {
  const id = formData.get("id") as string;
  const reason = (formData.get("reason") as string) || null;
  const { supabase, user } = await requireUser();
  await supabase
    .from("listings")
    .update({ status: "closed", close_reason: reason })
    .eq("id", id)
    .eq("owner_id", user.id);
  revalidatePath("/listings/mine");
  revalidatePath(`/listings/${id}`);
}

// Used on "İlanlarım" to pause/reactivate/close a listing.
export async function setListingStatusAction(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as ListingStatus;
  const { supabase, user } = await requireUser();

  await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .eq("owner_id", user.id);

  revalidatePath("/listings/mine");
}
