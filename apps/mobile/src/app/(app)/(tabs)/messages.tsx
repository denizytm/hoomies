import { Image } from "expo-image";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/lib/auth-context";
import { getConversations, type ConvListItem } from "@/lib/queries";
import { publicImageUrl } from "@/lib/storage";
import { colors } from "@/lib/theme";

function statusLabel(c: ConvListItem) {
  if (c.status === "accepted") return { text: "Aktif", color: "#059669" };
  if (c.status === "declined") return { text: "Reddedildi", color: colors.muted };
  return c.isHost
    ? { text: "Yeni istek", color: colors.primary }
    : { text: "Onay bekliyor", color: "#D97706" };
}

export default function MessagesScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ConvListItem[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getConversations(session.user.id)
        .then(setItems)
        .catch(() => setItems([]));
    }, [session?.user.id]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text, padding: 20, paddingBottom: 8 }}>
        Mesajlar
      </Text>

      {items === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontWeight: "700", color: colors.text, fontSize: 16 }}>Henüz mesajın yok</Text>
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}>
            Keşfet'te bir ilanı sağa kaydırarak ilgi göster.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          renderItem={({ item }) => {
            const s = statusLabel(item);
            const avatar = publicImageUrl("avatars", item.otherAvatar);
            return (
              <Pressable
                onPress={() => router.push(`/chat/${item.id}` as Href)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={{ width: 48, height: 48 }} contentFit="cover" />
                  ) : (
                    <Text style={{ color: colors.primary, fontWeight: "800" }}>
                      {item.otherName.slice(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: colors.text }} numberOfLines={1}>
                      {item.otherName}
                    </Text>
                    <Text style={{ color: s.color, fontSize: 12, fontWeight: "700" }}>{s.text}</Text>
                  </View>
                  <Text style={{ color: colors.muted }} numberOfLines={1}>
                    {item.lastMessage ?? item.listingTitle}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
