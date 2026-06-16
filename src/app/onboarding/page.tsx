import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { requireUser } from "@/lib/auth";
import type { UserRole } from "@/lib/types/database.types";

export const metadata = { title: "Uyum testi" };

export default async function OnboardingPage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) redirect("/listings");

  const [{ data: categories }, { data: questions }] = await Promise.all([
    supabase.from("compatibility_categories").select("*").order("position"),
    supabase.from("compatibility_questions").select("*").order("position"),
  ]);

  return (
    <OnboardingFlow
      categories={categories ?? []}
      questions={questions ?? []}
      role={(profile?.role as UserRole) ?? "seeker"}
    />
  );
}
