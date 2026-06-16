"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { profileFormSchema } from "@/lib/validation/profile";

export type ProfileState = { error?: string; success?: boolean } | null;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = profileFormSchema.safeParse({
    fullName: formData.get("fullName"),
    department: formData.get("department") ?? "",
    graduationDate: formData.get("graduationDate") ?? "",
    bio: formData.get("bio") ?? "",
    role: formData.get("role"),
    avatarUrl: formData.get("avatarUrl") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form geçersiz" };
  }

  const { supabase, user } = await requireUser();
  const d = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: d.fullName,
      department: d.department || null,
      graduation_date: d.graduationDate || null,
      bio: d.bio || null,
      role: d.role,
      avatar_url: d.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}

// Saves onboarding answers + role, then marks onboarding complete.
export async function saveOnboardingAction(input: {
  role: "host" | "seeker";
  answers: Record<string, number>;
}): Promise<{ error?: string }> {
  const entries = Object.entries(input.answers);
  if (entries.length !== 15) {
    return { error: "Lütfen tüm soruları yanıtla." };
  }

  const { supabase, user } = await requireUser();

  const rows = entries.map(([questionId, value]) => ({
    user_id: user.id,
    question_id: Number(questionId),
    value,
  }));

  const { error: answersError } = await supabase
    .from("compatibility_answers")
    .upsert(rows, { onConflict: "user_id,question_id" });

  if (answersError) return { error: answersError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: input.role, onboarding_completed: true })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  redirect("/listings");
}
