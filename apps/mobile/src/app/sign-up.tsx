import { emailDomain, registerSchema } from "@hoomies/shared/validation/auth";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field } from "@/components/form";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

type Role = "host" | "seeker";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("seeker");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      role,
      referralCode: "",
    });
    if (!parsed.success) {
      Alert.alert("Hata", parsed.error.issues[0]?.message ?? "Form geçersiz");
      return;
    }
    setLoading(true);
    const domain = emailDomain(parsed.data.email);
    const { data: uni } = await supabase
      .from("universities")
      .select("id")
      .contains("domains", [domain!])
      .maybeSingle();
    if (!uni) {
      setLoading(false);
      Alert.alert("Edu-mail gerekli", "Bu e-posta tanımlı bir üniversite uzantısı değil.");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Kayıt başarısız", error.message);
      return;
    }
    Alert.alert(
      "E-postanı kontrol et",
      "Hesabını etkinleştirmek için gönderdiğimiz onay bağlantısına tıkla, sonra giriş yap.",
      [{ text: "Tamam", onPress: () => router.replace("/sign-in") }],
    );
  }

  const roles: { value: Role; label: string; desc: string }[] = [
    { value: "seeker", label: "Ev Arayan", desc: "Oda/ev ve ev arkadaşı arıyorum" },
    { value: "host", label: "Ev Sunan", desc: "Boş odam/evim var" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16, flexGrow: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>Kayıt ol</Text>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>Ne arıyorsun?</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {roles.map((r) => {
                const active = role === r.value;
                return (
                  <Pressable
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    style={{
                      flex: 1,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.surface : "#fff",
                      borderRadius: 12,
                      padding: 12,
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: colors.text }}>{r.label}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{r.desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Field label="Ad Soyad" value={fullName} onChangeText={setFullName} placeholder="Deniz Yılmaz" />
          <Field
            label="Üniversite e-postası"
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
            placeholder="En az 8 karakter"
            secureTextEntry
          />

          <Btn title="Onay maili gönder" onPress={submit} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: colors.muted }}>Zaten hesabın var mı?</Text>
            <Link href="/sign-in" style={{ color: colors.primary, fontWeight: "700" }}>
              Giriş yap
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
