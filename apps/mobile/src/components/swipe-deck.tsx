import { Image } from "expo-image";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { DeckListing } from "@/lib/queries";
import { colors } from "@/lib/theme";

const { width } = Dimensions.get("window");
const THRESHOLD = width * 0.28;

function scoreColor(score: number) {
  if (score >= 75) return "#059669";
  if (score >= 50) return colors.primary;
  return "#D97706";
}

function CardContent({ card }: { card: DeckListing }) {
  const available = Math.max(card.capacity - card.occupied, 0);
  return (
    <>
      {card.photoUrl ? (
        <Image source={{ uri: card.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}
      {/* alt gradient yerine koyu katman */}
      <View style={styles.scrim} />

      {card.score != null && (
        <View style={[styles.score, { backgroundColor: scoreColor(card.score) }]}>
          <Text style={styles.scoreText}>%{card.score} uyum</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {card.title}
        </Text>
        <Text style={styles.meta}>
          {card.district}, {card.city}
        </Text>
        <View style={styles.row}>
          <Text style={styles.rent}>
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(card.monthly_rent)}
            <Text style={styles.rentSub}> /ay</Text>
          </Text>
          <Text style={styles.meta}>· {available} müsait kişi</Text>
        </View>
        <View style={styles.tags}>
          {card.furnished && <Text style={styles.tag}>Eşyalı</Text>}
          {card.pets_allowed && <Text style={styles.tag}>Evcil ✓</Text>}
        </View>
      </View>
    </>
  );
}

function TopCard({
  card,
  onSwipe,
}: {
  card: DeckListing;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD) {
        x.value = withTiming(width * 1.5, { duration: 200 }, () => runOnJS(onSwipe)("right"));
      } else if (e.translationX < -THRESHOLD) {
        x.value = withTiming(-width * 1.5, { duration: 200 }, () => runOnJS(onSwipe)("left"));
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-width, width], [-12, 12])}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1]) }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0]) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <CardContent card={card} />
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
          <Text style={styles.stampLikeText}>İLGİLENİYORUM</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampPass, passStyle]}>
          <Text style={styles.stampPassText}>PAS</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export function SwipeDeck({
  cards,
  onLike,
  onPass,
}: {
  cards: DeckListing[];
  onLike: (card: DeckListing) => void;
  onPass: (card: DeckListing) => void;
}) {
  const [index, setIndex] = useState(0);
  const current = cards[index];
  const next = cards[index + 1];

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    if (dir === "right") onLike(current);
    else onPass(current);
    setIndex((i) => i + 1);
  }

  if (!current) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Şimdilik bu kadar 🎉</Text>
        <Text style={styles.emptyText}>Yeni ilanlar geldikçe burada görünecek. Daha sonra tekrar bak.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.deck}>
        {next && (
          <View style={[styles.cardWrap, { transform: [{ scale: 0.95 }], opacity: 0.7 }]} pointerEvents="none">
            <View style={styles.card}>
              <CardContent card={next} />
            </View>
          </View>
        )}
        <View style={styles.cardWrap}>
          <TopCard key={current.id} card={current} onSwipe={handleSwipe} />
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable onPress={() => handleSwipe("left")} style={[styles.fab, styles.fabPass]}>
          <Text style={styles.fabPassText}>✕</Text>
        </Pressable>
        <Pressable onPress={() => handleSwipe("right")} style={[styles.fab, styles.fabLike]}>
          <Text style={styles.fabLikeText}>♥</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { flex: 1, padding: 16 },
  cardWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  info: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 18, gap: 4 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  meta: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 },
  rent: { color: "#fff", fontSize: 18, fontWeight: "800" },
  rentSub: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.85)" },
  tags: { flexDirection: "row", gap: 6, marginTop: 8 },
  tag: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  score: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  scoreText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  stamp: {
    position: "absolute",
    top: 28,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 3,
  },
  stampLike: { left: 24, borderColor: "#059669", transform: [{ rotate: "-14deg" }] },
  stampLikeText: { color: "#059669", fontWeight: "900", fontSize: 18 },
  stampPass: { right: 24, borderColor: "#EF4444", transform: [{ rotate: "14deg" }] },
  stampPassText: { color: "#EF4444", fontWeight: "900", fontSize: 20 },
  buttons: { flexDirection: "row", justifyContent: "center", gap: 28, paddingVertical: 18 },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPass: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  fabPassText: { color: "#EF4444", fontSize: 28, fontWeight: "800", lineHeight: 32 },
  fabLike: { backgroundColor: colors.primary },
  fabLikeText: { color: "#fff", fontSize: 26, lineHeight: 30 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: colors.text },
  emptyText: { color: colors.muted, textAlign: "center", lineHeight: 22 },
});
