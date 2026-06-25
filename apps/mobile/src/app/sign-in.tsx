import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field } from "@/components/form";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) Alert.alert("Giriş başarısız", "E-posta veya şifre hatalı.");
  }

  async function demoLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@metu.edu.tr",
      password: "demodemo123",
    });
    setLoading(false);
    if (error) Alert.alert("Demo", "Demo hesabı bulunamadı. Önce Supabase'de oluştur.");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 24, gap: 18, flexGrow: 1, justifyContent: "center" }}>
          <View style={{ gap: 6, marginBottom: 8 }}>
            <Text style={{ fontSize: 30, fontWeight: "800", color: colors.primary }}>hoomies</Text>
            <Text style={{ color: colors.muted }}>Üniversiteli ev arkadaşı eşleşmesi</Text>
          </View>

          <Field
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ad.soyad@metu.edu.tr"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Field
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Btn title="Giriş yap" onPress={signIn} loading={loading} />
          <Btn title="Demo hesabıyla gir" onPress={demoLogin} variant="outline" disabled={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <Text style={{ color: colors.muted }}>Hesabın yok mu?</Text>
            <Link href="/sign-up" style={{ color: colors.primary, fontWeight: "700" }}>
              Kayıt ol
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
