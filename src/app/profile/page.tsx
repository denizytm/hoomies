import { redirect } from "next/navigation";
import { BadgeCheck, Gift, Sparkles, Star } from "lucide-react";

import { ProfileForm } from "@/features/profile/profile-form";
import { ReferralCodes } from "@/features/profile/referral-codes";
import { requireUser } from "@/lib/auth";
import { computeBadges } from "@/lib/loyalty";
import { cn } from "@/lib/utils";

export const metadata = { title: "Profilim" };

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  let universityName: string | null = null;
  if (profile.university_id) {
    const { data: uni } = await supabase
      .from("universities")
      .select("name")
      .eq("id", profile.university_id)
      .maybeSingle();
    universityName = uni?.name ?? null;
  }

  const { data: codes } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const badges = computeBadges(profile);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
      <p className="mt-1 text-muted-foreground">
        Profilini güncel tut — eşleşme şansını artırır.
      </p>

      {/* Puan & Rozetler */}
      <div className="mt-8 grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Star className="size-6" />
          </span>
          <div>
            <p className="text-2xl font-bold">{profile.points}</p>
            <p className="text-sm text-muted-foreground">puan</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-5">
          {badges.map((b) => (
            <span
              key={b.key}
              title={b.description}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
                b.earned
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-dashed border-border text-muted-foreground opacity-60",
              )}
            >
              {b.key === "founder" ? (
                <Sparkles className="size-4" />
              ) : b.key === "active" ? (
                <Star className="size-4" />
              ) : (
                <BadgeCheck className="size-4" />
              )}
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Referans kodları */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Gift className="size-4 text-primary" /> Referans kodların
        </h2>
        <ReferralCodes codes={codes ?? []} />
      </div>

      <div className="mt-8">
        <ProfileForm
          profile={profile}
          userId={user.id}
          universityName={universityName}
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}
