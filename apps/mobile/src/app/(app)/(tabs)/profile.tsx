import { ROLE_LABELS } from "@hoomies/shared/constants";
import { computeBadges } from "@hoomies/shared/loyalty";
import type { UserRole } from "@hoomies/shared/types/database.types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { getProfileFull } from "@/lib/queries";
import { colors } from "@/lib/theme";
import type { Profile } from "@hoomies/shared/types/database.types";

export default function ProfileScreen() {
  const { session, signOut } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [university, setUniversity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getProfileFull(session.user.id).then(({ profile, university }) => {
        setProfile(profile);
        setUniversity(university);
        setLoading(false);
      });
    }, [session?.user.id]),
  );

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const badges = computeBadges(profile);
  const initials = (profile.full_name ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 8 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 30, fontWeight: "800", color: colors.primary }}>{initials || "?"}</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            {profile.full_name ?? "İsimsiz"}
          </Text>
          <Text style={{ color: colors.muted }}>
            {[university, session?.user.email].filter(Boolean).join(" · ")}
          </Text>
          {profile.role && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>
                {ROLE_LABELS[profile.role as UserRole]}
              </Text>
            </View>
          )}
        </View>

        {/* Puan */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 18,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 34 }}>⭐</Text>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>{profile.points}</Text>
            <Text style={{ color: colors.muted }}>puan</Text>
          </View>
        </View>

        {/* Rozetler */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>Rozetler</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map((b) => (
              <View
                key={b.key}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: b.earned ? colors.primary : colors.border,
                  backgroundColor: b.earned ? colors.surface : "#fff",
                  opacity: b.earned ? 1 : 0.5,
                }}
              >
                <Text style={{ color: b.earned ? colors.primary : colors.muted, fontWeight: "600", fontSize: 13 }}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 8 }} />
        <Btn
          title="Uyum sorularını güncelle"
          onPress={() => router.push("/compat-edit")}
          variant="outline"
        />
        <Btn title="Çıkış yap" onPress={signOut} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}
