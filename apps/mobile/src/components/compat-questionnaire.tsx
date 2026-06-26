import type {
  CompatibilityCategory,
  CompatibilityQuestion,
  QuestionOption,
} from "@hoomies/shared/types/database.types";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";

import { Btn } from "@/components/form";
import { colors } from "@/lib/theme";

export function CompatQuestionnaire({
  categories,
  questions,
  initial,
  submitLabel,
  warnIncomplete,
  onSubmit,
}: {
  categories: CompatibilityCategory[];
  questions: CompatibilityQuestion[];
  initial: Record<number, number>;
  submitLabel: string;
  warnIncomplete: boolean;
  onSubmit: (answers: Record<number, number>) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Record<number, number>>(initial);
  const [saving, setSaving] = useState(false);

  function goBack() {
    setDirection("back");
    setStep((s) => Math.max(0, s - 1));
  }

  const cat = categories[step];
  const stepQuestions = questions.filter((q) => q.category_id === cat?.id);
  const answeredCount = questions.filter((q) => answers[q.id] != null).length;
  const pct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLast = step === categories.length - 1;

  async function finish() {
    setSaving(true);
    try {
      await onSubmit(answers);
    } catch (e) {
      setSaving(false);
      Alert.alert("Hata", e instanceof Error ? e.message : "Kaydedilemedi");
    }
  }

  function onNext() {
    if (!isLast) {
      setDirection("forward");
      setStep((s) => s + 1);
      return;
    }
    if (warnIncomplete && answeredCount < questions.length) {
      Alert.alert(
        "Eksik yanıtlar",
        `${answeredCount}/${questions.length} soruyu yanıtladın. Boş bıraktığın sorular için uyum skorun tam doğru hesaplanamayabilir. İstediğin zaman Profil'den tamamlayabilirsin.`,
        [
          { text: "Cevaplamaya devam et", style: "cancel" },
          { text: "Yine de bitir", onPress: finish },
        ],
      );
    } else {
      finish();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom"]}>
      {/* İlerleme */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>{cat?.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            {step + 1} / {categories.length}
          </Text>
        </View>
        <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.border, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: 8, backgroundColor: colors.primary }} />
        </View>
        <Text style={{ color: colors.muted, fontSize: 12 }}>%{pct} yanıtlandı</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
          Yaşam tarzını tanıyalım
        </Text>
        <Text style={{ color: colors.muted, marginTop: -6 }}>
          İstersen boş bırak — sonra Profil'den güncelleyebilirsin.
        </Text>

        <Animated.View
          key={step}
          entering={(direction === "back" ? SlideInLeft : SlideInRight).duration(220)}
          style={{ gap: 14 }}
        >
          {stepQuestions.map((q) => {
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
                      onPress={() =>
                        setAnswers((a) => {
                          const next = { ...a };
                          // aynı seçeneğe tekrar basınca temizle (boş bırak)
                          if (next[q.id] === o.value) delete next[q.id];
                          else next[q.id] = o.value;
                          return next;
                        })
                      }
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: 999,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.surface : "#fff",
                      }}
                    >
                      <Text style={{ color: active ? colors.primary : colors.text, fontWeight: active ? "700" : "500", fontSize: 13 }}>
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
          })}
        </Animated.View>
      </ScrollView>

      {/* Alt: Geri / İleri / Bitir */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          padding: 16,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <Btn title="Geri" variant="outline" onPress={goBack} disabled={step === 0 || saving} />
        </View>
        <View style={{ flex: 1 }}>
          <Btn title={isLast ? submitLabel : "İleri"} onPress={onNext} loading={saving} />
        </View>
      </View>
    </SafeAreaView>
  );
}
