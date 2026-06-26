import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeDeck } from "@/components/swipe-deck";
import { useSession } from "@/lib/auth-context";
import { getDeck, likeListing, passListing, type DeckListing } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function DeckScreen() {
  const { session } = useSession();
  const [cards, setCards] = useState<DeckListing[] | null>(null);

  useEffect(() => {
    if (!session) return;
    getDeck(session.user.id)
      .then(setCards)
      .catch(() => setCards([]));
  }, [session?.user.id]);

  const onLike = useCallback(
    (card: DeckListing) => {
      if (session) void likeListing(session.user.id, card).catch(() => {});
    },
    [session],
  );

  const onPass = useCallback(
    (card: DeckListing) => {
      if (session) void passListing(session.user.id, card.id).catch(() => {});
    },
    [session],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.primary }}>hoomies</Text>
      </View>
      {cards === null ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <SwipeDeck cards={cards} onLike={onLike} onPass={onPass} />
      )}
    </SafeAreaView>
  );
}
