import type { SortKey } from "@/lib/constants";
import { isEffectivelyBanned } from "@/lib/ban";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingPhoto, Profile } from "@/lib/types/database.types";
import type { ListingFilters } from "@/lib/validation/listing";

export type ListingWithPhotos = Listing & {
  photos: ListingPhoto[];
  // Uyum yüzdesi (görüntüleyen kullanıcı ile ilan sahibi arasında). null = hesaplanamadı.
  score: number | null;
};

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
  return listings.map((l) => ({
    ...l,
    photos: byListing.get(l.id) ?? [],
    score: null,
  }));
}

// Görüntüleyen kullanıcı ile ilan sahipleri arasındaki uyum yüzdesini doldurur.
async function attachScores(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listings: ListingWithPhotos[],
): Promise<ListingWithPhotos[]> {
  if (listings.length === 0) return listings;
  const ownerIds = [...new Set(listings.map((l) => l.owner_id))];
  const { data } = await supabase.rpc("compatibility_scores", {
    other_users: ownerIds,
  });
  const map = new Map((data ?? []).map((s) => [s.user_id, s.score]));
  return listings.map((l) => ({ ...l, score: map.get(l.owner_id) ?? null }));
}

const availableOf = (l: ListingWithPhotos) =>
  Math.max((l.capacity ?? 0) - (l.occupied ?? 0), 0);

export async function getListings(
  filters: ListingFilters,
  sort: SortKey = "recommended",
): Promise<ListingWithPhotos[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString()) // süresi dolanları gizle
    .order("created_at", { ascending: false });

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.minRent != null) query = query.gte("monthly_rent", filters.minRent);
  if (filters.maxRent != null) query = query.lte("monthly_rent", filters.maxRent);
  if (filters.pets) query = query.eq("pets_allowed", true);

  const { data } = await query;
  const withPhotos = await attachPhotos(supabase, data ?? []);
  const withScores = await attachScores(supabase, withPhotos);

  // Sahip bilgisi: banlı sahiplerin ilanlarını gizle + arama önceliği (puan)
  const ownerIds = [...new Set(withScores.map((l) => l.owner_id))];
  const { data: owners } = await supabase
    .from("profiles")
    .select("id, points, banned, banned_until")
    .in("id", ownerIds);
  const ptMap = new Map((owners ?? []).map((p) => [p.id, p.points]));
  const bannedSet = new Set(
    (owners ?? []).filter((p) => isEffectivelyBanned(p)).map((p) => p.id),
  );

  let result = withScores.filter((l) => !bannedSet.has(l.owner_id));
  if (filters.minAvailable != null) {
    result = result.filter((l) => availableOf(l) >= filters.minAvailable!);
  }

  switch (sort) {
    case "compatibility":
      result.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      break;
    case "newest":
      result.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case "rent_asc":
      result.sort((a, b) => a.monthly_rent - b.monthly_rent);
      break;
    case "rent_desc":
      result.sort((a, b) => b.monthly_rent - a.monthly_rent);
      break;
    case "available":
      result.sort((a, b) => availableOf(b) - availableOf(a));
      break;
    default: // recommended: yüksek puanlı sahipler önde
      result.sort((a, b) => (ptMap.get(b.owner_id) ?? 0) - (ptMap.get(a.owner_id) ?? 0));
      break;
  }
  return result;
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

  const [withScore] = await attachScores(supabase, await attachPhotos(supabase, [listing]));

  const { data: owner } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, department, graduation_date, university_id, banned, banned_until",
    )
    .eq("id", listing.owner_id)
    .maybeSingle();

  // Etkin banlı kullanıcının ilanı görüntülenemez.
  if (owner && isEffectivelyBanned(owner)) return null;

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
    ...withScore,
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
