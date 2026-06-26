import type {
  CompatibilityCategory,
  CompatibilityQuestion,
} from "@hoomies/shared/types/database.types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { CompatQuestionnaire } from "@/components/compat-questionnaire";
import { useSession } from "@/lib/auth-context";
import { getMyAnswers, getOnboardingData, saveAnswers } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function CompatEdit() {
  const { session } = useSession();
  const [data, setData] = useState<{
    categories: CompatibilityCategory[];
    questions: CompatibilityQuestion[];
    initial: Record<number, number>;
  } | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([getOnboardingData(), getMyAnswers(session.user.id)]).then(([d, initial]) =>
      setData({ ...d, initial }),
    );
  }, [session?.user.id]);

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <CompatQuestionnaire
      categories={data.categories}
      questions={data.questions}
      initial={data.initial}
      submitLabel="Kaydet"
      warnIncomplete={false}
      onSubmit={async (answers) => {
        if (!session) return;
        await saveAnswers(session.user.id, answers);
        router.back();
      }}
    />
  );
}
