import { redirect } from "next/navigation";

import { ProfileForm } from "@/features/profile/profile-form";
import { requireUser } from "@/lib/auth";

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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>
      <p className="mt-1 text-muted-foreground">
        Profilini güncel tut — eşleşme şansını artırır.
      </p>
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
