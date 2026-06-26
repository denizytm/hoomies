import { isEffectivelyBanned } from "@hoomies/shared/ban";
import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  Profile,
  QuestionOption,
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

// --- Konuşmalar / sohbet ---

export type ConvListItem = {
  id: string;
  status: string;
  isHost: boolean;
  otherName: string;
  otherAvatar: string | null;
  listingTitle: string;
  lastMessage: string | null;
  updatedAt: string;
};

export async function getConversations(userId: string): Promise<ConvListItem[]> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .or(`seeker_id.eq.${userId},host_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (!convs?.length) return [];

  const listingIds = [...new Set(convs.map((c) => c.listing_id))];
  const otherIds = [...new Set(convs.map((c) => (c.host_id === userId ? c.seeker_id : c.host_id)))];
  const convIds = convs.map((c) => c.id);

  const [{ data: listings }, { data: profiles }, { data: msgs }] = await Promise.all([
    supabase.from("listings").select("id, title").in("id", listingIds),
    supabase.from("profiles").select("id, full_name, avatar_url").in("id", otherIds),
    supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
  ]);

  const lm = new Map((listings ?? []).map((l) => [l.id, l.title]));
  const pm = new Map((profiles ?? []).map((p) => [p.id, p]));
  const last = new Map<string, string>();
  for (const m of msgs ?? []) if (!last.has(m.conversation_id)) last.set(m.conversation_id, m.body);

  return convs.map((c) => {
    const otherId = c.host_id === userId ? c.seeker_id : c.host_id;
    const other = pm.get(otherId);
    return {
      id: c.id,
      status: c.status,
      isHost: c.host_id === userId,
      otherName: other?.full_name ?? "Kullanıcı",
      otherAvatar: other?.avatar_url ?? null,
      listingTitle: lm.get(c.listing_id) ?? "İlan",
      lastMessage: last.get(c.id) ?? null,
      updatedAt: c.updated_at,
    };
  });
}

export type ChatMessage = { id: string; sender_id: string; body: string };

export type ChatDetail = {
  status: string;
  isHost: boolean;
  otherName: string;
  listingId: string | null;
  listingStatus: string | null;
  listingTitle: string | null;
  district: string | null;
  messages: ChatMessage[];
  otherScore: number | null;
  otherAnswers: { question: string; answer: string }[];
};

export async function getConversationDetail(
  id: string,
  userId: string,
): Promise<ChatDetail | null> {
  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!conv) return null;

  const isHost = conv.host_id === userId;
  const otherId = isHost ? conv.seeker_id : conv.host_id;

  const [{ data: listing }, { data: other }, { data: messages }, { data: rawAnswers }] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id, title, district, status")
        .eq("id", conv.listing_id)
        .maybeSingle(),
      supabase.from("profiles").select("id, full_name").eq("id", otherId).maybeSingle(),
      supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }),
      supabase.rpc("conversation_other_answers", { conv_id: id }),
    ]);

  let otherScore: number | null = null;
  let otherAnswers: { question: string; answer: string }[] = [];
  if (rawAnswers && rawAnswers.length > 0) {
    const [{ data: scores }, { data: questions }] = await Promise.all([
      supabase.rpc("compatibility_scores", { other_users: [otherId] }),
      supabase.from("compatibility_questions").select("*").order("position"),
    ]);
    otherScore = scores?.[0]?.score ?? null;
    const vMap = new Map(rawAnswers.map((a) => [a.question_id, a.value]));
    otherAnswers = (questions ?? [])
      .filter((q) => vMap.has(q.id))
      .map((q) => {
        const opts = q.options as unknown as QuestionOption[];
        const v = vMap.get(q.id);
        return { question: q.question, answer: opts.find((o) => o.value === v)?.label ?? String(v) };
      });
  }

  return {
    status: conv.status,
    isHost,
    otherName: other?.full_name ?? "Kullanıcı",
    listingId: listing?.id ?? null,
    listingStatus: listing?.status ?? null,
    listingTitle: listing?.title ?? null,
    district: listing?.district ?? null,
    messages: (messages ?? []).map((m) => ({ id: m.id, sender_id: m.sender_id, body: m.body })),
    otherScore,
    otherAnswers,
  };
}

export async function sendMessage(convId: string, senderId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: convId, sender_id: senderId, body });
  if (error) throw error;
}

export async function setConversationStatus(
  id: string,
  status: "accepted" | "declined",
  userId: string,
): Promise<void> {
  await supabase.from("conversations").update({ status }).eq("id", id).eq("host_id", userId);
}

export async function closeListing(
  listingId: string,
  userId: string,
  reason = "matched",
): Promise<void> {
  await supabase
    .from("listings")
    .update({ status: "closed", close_reason: reason })
    .eq("id", listingId)
    .eq("owner_id", userId);
}

// --- Profil ---

export async function getProfileFull(
  userId: string,
): Promise<{ profile: Profile | null; university: string | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  let university: string | null = null;
  if (profile?.university_id) {
    const { data: u } = await supabase
      .from("universities")
      .select("name")
      .eq("id", profile.university_id)
      .maybeSingle();
    university = u?.name ?? null;
  }
  return { profile: profile ?? null, university };
}
