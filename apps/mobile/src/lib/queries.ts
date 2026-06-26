import { isEffectivelyBanned } from "@hoomies/shared/ban";
import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  UserRole,
} from "@hoomies/shared/types/database.types";

import { supabase } from "@/lib/supabase";
import { publicImageUrl } from "@/lib/storage";

export async function getOnboardingData(): Promise<{
  categories: CompatibilityCategory[];
  questions: CompatibilityQuestion[];
}> {
  const [{ data: categories }, { data: questions }] = await Promise.all([
    supabase.from("compatibility_categories").select("*").order("position"),
    supabase.from("compatibility_questions").select("*").order("position"),
  ]);
  return { categories: categories ?? [], questions: questions ?? [] };
}

export async function saveOnboarding(
  userId: string,
  role: UserRole,
  answers: Record<number, number>,
): Promise<void> {
  const rows = Object.entries(answers).map(([qid, value]) => ({
    user_id: userId,
    question_id: Number(qid),
    value,
  }));
  const { error: e1 } = await supabase
    .from("compatibility_answers")
    .upsert(rows, { onConflict: "user_id,question_id" });
  if (e1) throw e1;
  const { error: e2 } = await supabase
    .from("profiles")
    .update({ role, onboarding_completed: true })
    .eq("id", userId);
  if (e2) throw e2;
}

export type DeckListing = {
  id: string;
  title: string;
  monthly_rent: number;
  dues: number | null;
  city: string;
  district: string;
  neighborhood: string | null;
  capacity: number;
  occupied: number;
  furnished: boolean;
  pets_allowed: boolean;
  owner_id: string;
  score: number | null;
  photoUrl: string | null;
};

export async function getDeck(userId: string): Promise<DeckListing[]> {
  const [{ data: passes }, { data: convs }] = await Promise.all([
    supabase.from("listing_passes").select("listing_id").eq("user_id", userId),
    supabase.from("conversations").select("listing_id").eq("seeker_id", userId),
  ]);
  const excluded = new Set<string>([
    ...(passes ?? []).map((p) => p.listing_id),
    ...(convs ?? []).map((c) => c.listing_id),
  ]);

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .neq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const candidates = (listings ?? []).filter((l) => !excluded.has(l.id));
  if (candidates.length === 0) return [];

  const ownerIds = [...new Set(candidates.map((l) => l.owner_id))];
  const [{ data: owners }, { data: scores }, { data: photos }] = await Promise.all([
    supabase.from("profiles").select("id, banned, banned_until").in("id", ownerIds),
    supabase.rpc("compatibility_scores", { other_users: ownerIds }),
    supabase
      .from("listing_photos")
      .select("listing_id, storage_path, position")
      .in("listing_id", candidates.map((l) => l.id))
      .order("position", { ascending: true }),
  ]);

  const bannedSet = new Set(
    (owners ?? []).filter((o) => isEffectivelyBanned(o)).map((o) => o.id),
  );
  const scoreMap = new Map((scores ?? []).map((s) => [s.user_id, s.score]));
  const coverMap = new Map<string, string>();
  for (const p of photos ?? []) {
    if (!coverMap.has(p.listing_id)) coverMap.set(p.listing_id, p.storage_path);
  }

  return candidates
    .filter((l) => !bannedSet.has(l.owner_id))
    .map((l) => ({
      id: l.id,
      title: l.title,
      monthly_rent: l.monthly_rent,
      dues: l.dues,
      city: l.city,
      district: l.district,
      neighborhood: l.neighborhood,
      capacity: l.capacity,
      occupied: l.occupied,
      furnished: l.furnished,
      pets_allowed: l.pets_allowed,
      owner_id: l.owner_id,
      score: scoreMap.get(l.owner_id) ?? null,
      photoUrl: publicImageUrl("listing-photos", coverMap.get(l.id)),
    }));
}

export async function passListing(userId: string, listingId: string): Promise<void> {
  await supabase
    .from("listing_passes")
    .upsert({ user_id: userId, listing_id: listingId }, { onConflict: "user_id,listing_id" });
}

// Sağa kaydırma = ilgilenme: pending konuşma oluştur (varsa mevcut).
export async function likeListing(
  userId: string,
  listing: { id: string; owner_id: string },
): Promise<void> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("seeker_id", userId)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase.from("conversations").insert({
    listing_id: listing.id,
    seeker_id: userId,
    host_id: listing.owner_id,
  });
  if (error) throw error;
}
