import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import {
  closeListing,
  getConversationDetail,
  sendMessage,
  setConversationStatus,
  type ChatDetail,
  type ChatMessage,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const meId = session?.user.id;

  const [detail, setDetail] = useState<ChatDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    if (!id || !meId) return;
    const d = await getConversationDetail(id, meId);
    setDetail(d);
    setMessages(d?.messages ?? []);
  }, [id, meId]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime
  useEffect(() => {
    if (!id || detail?.status !== "accepted") return;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as { id: string; sender_id: string; body: string };
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, { id: m.id, sender_id: m.sender_id, body: m.body }],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, detail?.status]);

  async function send() {
    const text = body.trim();
    if (!text || !id || !meId) return;
    setSending(true);
    try {
      await sendMessage(id, meId, text);
      setBody("");
    } catch (e) {
      Alert.alert("Hata", e instanceof Error ? e.message : "Mesaj gönderilemedi");
    }
    setSending(false);
  }

  async function changeStatus(next: "accepted" | "declined") {
    if (!id || !meId) return;
    setBusy(true);
    await setConversationStatus(id, next, meId);
    await load();
    setBusy(false);
  }

  async function close() {
    if (!detail?.listingId || !meId) return;
    setBusy(true);
    await closeListing(detail.listingId, meId);
    await load();
    setBusy(false);
  }

  if (!detail) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Pending
  if (detail.status === "pending") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 12 }}>
          {detail.isHost ? (
            <>
              <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, textAlign: "center" }}>
                {detail.otherName} ilanınla ilgileniyor
              </Text>
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                Onaylarsan mesajlaşma açılır.
              </Text>
              {detail.otherScore != null && (
                <Text style={{ color: colors.primary, fontWeight: "800" }}>%{detail.otherScore} uyum</Text>
              )}
              <CompatList answers={detail.otherAnswers} />
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <Pressable
                  onPress={() => changeStatus("accepted")}
                  disabled={busy}
                  style={{ backgroundColor: colors.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Onayla</Text>
                </Pressable>
                <Pressable
                  onPress={() => changeStatus("declined")}
                  disabled={busy}
                  style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 }}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>Reddet</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ fontWeight: "700", color: colors.text }}>İsteğin gönderildi</Text>
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                {detail.otherName} onayladığında mesajlaşma açılır.
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (detail.status === "declined") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: 28 }}>
        <Text style={{ color: colors.muted }}>Bu istek reddedildi.</Text>
      </View>
    );
  }

  // Accepted
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Üst: kafe önerisi + (host) kapat + uyum profili */}
        <View style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
          <Text style={{ color: colors.muted, fontSize: 12, padding: 10, paddingBottom: 6 }}>
            ☕ İlk buluşma için {detail.district ? `${detail.district}'te ` : ""}yakın bir kafeyi öner. Ev
            adresini ancak tanıştıktan sonra paylaş.
          </Text>
          {detail.isHost && detail.listingStatus !== "closed" && (
            <Pressable onPress={close} disabled={busy} style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                🎉 Anlaştıysanız ilanı kapat
              </Text>
            </Pressable>
          )}
          {detail.otherAnswers.length > 0 && (
            <Pressable onPress={() => setShowProfile((s) => !s)} style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>
                {showProfile ? "▼" : "▶"} {detail.otherName} uyum profili
                {detail.otherScore != null ? `  ·  %${detail.otherScore}` : ""}
              </Text>
            </Pressable>
          )}
          {showProfile && detail.otherAnswers.length > 0 && (
            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
              <CompatList answers={detail.otherAnswers} />
            </View>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: colors.muted, marginTop: 24 }}>
              Henüz mesaj yok. İlk mesajı sen gönder 👋
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === meId;
            return (
              <View style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
                <View
                  style={{
                    backgroundColor: mine ? colors.primary : "#EFEFF2",
                    borderRadius: 16,
                    borderBottomRightRadius: mine ? 4 : 16,
                    borderBottomLeftRadius: mine ? 16 : 4,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                  }}
                >
                  <Text style={{ color: mine ? "#fff" : colors.text, fontSize: 15 }}>{item.body}</Text>
                </View>
              </View>
            );
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: 10,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          }}
        >
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Mesaj yaz…"
            placeholderTextColor={colors.muted}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={send}
            disabled={sending || !body.trim()}
            style={{
              backgroundColor: colors.primary,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: sending || !body.trim() ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CompatList({ answers }: { answers: { question: string; answer: string }[] }) {
  if (answers.length === 0) return null;
  return (
    <View style={{ width: "100%", gap: 6, marginTop: 6 }}>
      {answers.map((a, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }}>{a.question}</Text>
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>{a.answer}</Text>
        </View>
      ))}
    </View>
  );
}
