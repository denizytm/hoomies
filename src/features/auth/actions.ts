"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { emailDomain, loginSchema, registerSchema } from "@/lib/validation/auth";

export type AuthState = { error?: string } | null;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    referralCode: formData.get("referralCode") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form geçersiz" };
  }

  const { fullName, email, password, role, referralCode } = parsed.data;
  const supabase = await createClient();

  // Pre-check the edu-mail domain for a friendly message. The DB trigger enforces
  // the same rule as a hard guarantee even if this check is bypassed.
  const domain = emailDomain(email);
  if (!domain) return { error: "Geçerli bir e-posta gir" };

  const { data: uni } = await supabase
    .from("universities")
    .select("id")
    .contains("domains", [domain])
    .maybeSingle();

  if (!uni) {
    return {
      error:
        "Bu e-posta tanımlı bir üniversite (edu) uzantısı değil. Öğrenci e-postanı kullan.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, referral_code: referralCode ?? "" },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If e-mail confirmation is disabled, signUp returns an active session —
  // skip the "check your email" screen and go straight to onboarding.
  if (data.session) {
    redirect("/onboarding");
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form geçersiz" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (formData.get("redirect") as string) || null;
  if (redirectTo && redirectTo.startsWith("/")) redirect(redirectTo);

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user!.id)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? "/listings" : "/onboarding");
}

// --- GEÇİCİ: test için demo hesabı girişi. İş bitince bu action + buton kaldırılacak. ---
const DEMO_EMAIL = "demo@metu.edu.tr";
const DEMO_PASSWORD = "demodemo123";

export async function demoLoginAction(): Promise<AuthState> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (error || !user) {
    return {
      error:
        "Demo hesabı henüz oluşturulmamış. Supabase'de demo@metu.edu.tr kullanıcısını oluştur.",
    };
  }

  // Her demo girişi "ilk kez" gibi başlasın: önceki yanıtları sil, onboarding'i
  // sıfırla ve uyum sorularına yönlendir.
  await supabase.from("compatibility_answers").delete().eq("user_id", user.id);
  await supabase
    .from("profiles")
    .update({ onboarding_completed: false })
    .eq("id", user.id);

  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
