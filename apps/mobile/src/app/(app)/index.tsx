import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn } from "@/components/form";
import { useSession } from "@/lib/auth-context";
import { colors } from "@/lib/theme";

export default function Home() {
  const { session, signOut } = useSession();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 24, gap: 14, justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>Hoş geldin 👋</Text>
        <Text style={{ color: colors.muted }}>{session?.user.email}</Text>
        <Text style={{ color: colors.muted, lineHeight: 22 }}>
          Giriş çalışıyor. Sıradaki adımda kaydırmalı (swipe) ilan eşleşmesi, onboarding ve
          mesajlaşma ekranları gelecek.
        </Text>
        <View style={{ height: 8 }} />
        <Btn title="Çıkış yap" onPress={signOut} variant="outline" />
      </View>
    </SafeAreaView>
  );
}
