import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  QuestionOption,
  UserRole,
} from "@hoomies/shared/types/database.types";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { getOnboardingData, saveOnboarding } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function Onboarding() {
  const { session, profile, refreshProfile } = useSession();
  const [categories, setCategories] = useState<CompatibilityCategory[]>([]);
  const [questions, setQuestions] = useState<CompatibilityQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOnboardingData().then(({ categories, questions }) => {
      setCategories(categories);
      setQuestions(questions);
      setLoading(false);
    });
  }, []);

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] != null);

  async function submit() {
    if (!session) return;
    if (!allAnswered) {
      Alert.alert("Eksik", "Lütfen tüm soruları yanıtla.");
      return;
    }
    setSaving(true);
    try {
      await saveOnboarding(session.user.id, (profile?.role as UserRole) ?? "seeker", answers);
      await refreshProfile();
    } catch (e) {
      setSaving(false);
      Alert.alert("Hata", e instanceof Error ? e.message : "Kaydedilemedi");
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
            Yaşam tarzını tanıyalım
          </Text>
          <Text style={{ color: colors.muted }}>
            Bu yanıtlar uyum skorunu belirler — sonra güncelleyebilirsin.
          </Text>
        </View>

        {categories.map((cat) => (
          <View key={cat.id} style={{ gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary, textTransform: "uppercase" }}>
              {cat.name}
            </Text>
            {questions
              .filter((q) => q.category_id === cat.id)
              .map((q) => {
                const opts = q.options as unknown as QuestionOption[];
                return (
                  <View
                    key={q.id}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, gap: 10, backgroundColor: "#fff" }}
                  >
                    <Text style={{ fontWeight: "600", color: colors.text }}>{q.question}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {opts.map((o) => {
                        const active = answers[q.id] === o.value;
                        return (
                          <Pressable
                            key={o.value}
                            onPress={() => setAnswers((a) => ({ ...a, [q.id]: o.value }))}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 9,
                              borderRadius: 999,
                              borderWidth: active ? 2 : 1,
                              borderColor: active ? colors.primary : colors.border,
                              backgroundColor: active ? colors.surface : "#fff",
                            }}
                          >
                            <Text
                              style={{
                                color: active ? colors.primary : colors.text,
                                fontWeight: active ? "700" : "500",
                                fontSize: 13,
                              }}
                            >
                              {o.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
          </View>
        ))}

        <Btn
          title={allAnswered ? "Tamamla" : "Tüm soruları yanıtla"}
          onPress={submit}
          loading={saving}
          disabled={!allAnswered}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
