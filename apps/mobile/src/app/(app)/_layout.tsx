import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useSession } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function AppLayout() {
  const { profile, isLoading } = useSession();

  if (isLoading || profile === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const onboarded = profile.onboarding_completed;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: true, title: "Sohbet", headerTintColor: colors.text }}
        />
      </Stack.Protected>
    </Stack>
  );
}
