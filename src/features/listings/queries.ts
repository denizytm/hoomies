import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingPhoto, Profile } from "@/lib/types/database.types";
import type { ListingFilters } from "@/lib/validation/listing";

export type ListingWithPhotos = Listing & { photos: ListingPhoto[] };

async function attachPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listings: Listing[],
): Promise<ListingWithPhotos[]> {
  if (listings.length === 0) return [];
  const ids = listings.map((l) => l.id);
  const { data: photos } = await supabase
    .from("listing_photos")
    .select("*")
    .in("listing_id", ids)
    .order("position", { ascending: true });

  const byListing = new Map<string, ListingPhoto[]>();
  for (const p of photos ?? []) {
    const arr = byListing.get(p.listing_id) ?? [];
    arr.push(p);
    byListing.set(p.listing_id, arr);
  }
  return listings.map((l) => ({ ...l, photos: byListing.get(l.id) ?? [] }));
}

export async function getListings(filters: ListingFilters): Promise<ListingWithPhotos[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.minRent != null) query = query.gte("monthly_rent", filters.minRent);
  if (filters.maxRent != null) query = query.lte("monthly_rent", filters.maxRent);
  if (filters.rooms != null) query = query.gte("room_count", filters.rooms);
  if (filters.pets) query = query.eq("pets_allowed", true);

  const { data } = await query;
  return attachPhotos(supabase, data ?? []);
}

export async function getMyListings(ownerId: string): Promise<ListingWithPhotos[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  return attachPhotos(supabase, data ?? []);
}

export type ListingDetail = ListingWithPhotos & {
  owner: Pick<Profile, "id" | "full_name" | "avatar_url" | "department" | "graduation_date"> | null;
  ownerUniversity: string | null;
};

export async function getListingById(id: string): Promise<ListingDetail | null> {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!listing) return null;

  const [withPhotos] = await attachPhotos(supabase, [listing]);

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, department, graduation_date, university_id")
    .eq("id", listing.owner_id)
    .maybeSingle();

  let ownerUniversity: string | null = null;
  if (owner?.university_id) {
    const { data: uni } = await supabase
      .from("universities")
      .select("name")
      .eq("id", owner.university_id)
      .maybeSingle();
    ownerUniversity = uni?.name ?? null;
  }

  return {
    ...withPhotos,
    owner: owner
      ? {
          id: owner.id,
          full_name: owner.full_name,
          avatar_url: owner.avatar_url,
          department: owner.department,
          graduation_date: owner.graduation_date,
        }
      : null,
    ownerUniversity,
  };
}
