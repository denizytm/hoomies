import { createClient } from "@/lib/supabase/server";
import type {
  Conversation,
  ConversationStatus,
  Message,
  QuestionOption,
} from "@/lib/types/database.types";

export type ConversationListItem = {
  id: string;
  status: ConversationStatus;
  isHost: boolean;
  listingId: string;
  listingTitle: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string | null;
  updatedAt: string;
};

export async function getConversationsForUser(
  userId: string,
): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .or(`seeker_id.eq.${userId},host_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (!convs?.length) return [];

  const listingIds = [...new Set(convs.map((c) => c.listing_id))];
  const otherIds = [
    ...new Set(convs.map((c) => (c.host_id === userId ? c.seeker_id : c.host_id))),
  ];
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

  const listingMap = new Map((listings ?? []).map((l) => [l.id, l.title]));
  const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const lastMsgMap = new Map<string, string>();
  for (const m of msgs ?? []) {
    if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m.body);
  }

  return convs.map((c) => {
    const otherId = c.host_id === userId ? c.seeker_id : c.host_id;
    const other = profMap.get(otherId);
    return {
      id: c.id,
      status: c.status,
      isHost: c.host_id === userId,
      listingId: c.listing_id,
      listingTitle: listingMap.get(c.listing_id) ?? "İlan",
      otherName: other?.full_name ?? "Kullanıcı",
      otherAvatar: other?.avatar_url ?? null,
      lastMessage: lastMsgMap.get(c.id) ?? null,
      updatedAt: c.updated_at,
    };
  });
}

export type CompatibilityAnswerView = {
  question: string;
  answer: string;
  category: string;
};

export type ConversationDetail = {
  conversation: Conversation;
  listing: { id: string; title: string; city: string; district: string; status: string } | null;
  isHost: boolean;
  other: { id: string; full_name: string | null; avatar_url: string | null } | null;
  messages: Message[];
  otherScore: number | null;
  otherAnswers: CompatibilityAnswerView[];
};

export async function getConversation(
  id: string,
  userId: string,
): Promise<ConversationDetail | null> {
  const supabase = await createClient();
  // RLS: only participants can read; returns null otherwise.
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) return null;

  const isHost = conversation.host_id === userId;
  const otherId = isHost ? conversation.seeker_id : conversation.host_id;

  const [{ data: listing }, { data: other }, { data: messages }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, city, district, status")
      .eq("id", conversation.listing_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", otherId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  // Karşı tarafın uyum cevapları (RPC, sadece taraflar görebilir) + skor
  const { data: rawAnswers } = await supabase.rpc("conversation_other_answers", {
    conv_id: id,
  });

  let otherScore: number | null = null;
  let otherAnswers: CompatibilityAnswerView[] = [];

  if (rawAnswers && rawAnswers.length > 0) {
    const [{ data: scores }, { data: questions }, { data: cats }] = await Promise.all([
      supabase.rpc("compatibility_scores", { other_users: [otherId] }),
      supabase.from("compatibility_questions").select("*").order("position"),
      supabase.from("compatibility_categories").select("*"),
    ]);
    otherScore = scores?.[0]?.score ?? null;

    const valueMap = new Map(rawAnswers.map((a) => [a.question_id, a.value]));
    const catMap = new Map((cats ?? []).map((c) => [c.id, c.name]));
    otherAnswers = (questions ?? [])
      .filter((q) => valueMap.has(q.id))
      .map((q) => {
        const opts = (q.options as QuestionOption[]) ?? [];
        const v = valueMap.get(q.id);
        return {
          question: q.question,
          answer: opts.find((o) => o.value === v)?.label ?? String(v),
          category: catMap.get(q.category_id) ?? "",
        };
      });
  }

  return {
    conversation,
    listing: listing ?? null,
    isHost,
    other: other ?? null,
    messages: messages ?? [],
    otherScore,
    otherAnswers,
  };
}
