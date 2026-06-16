"use client";

import { useActionState, useEffect, useState } from "react";
import { BadgeCheck, GraduationCap, Home, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { AvatarUploader } from "@/features/profile/avatar-uploader";
import { updateProfileAction } from "@/features/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import type { Profile, UserRole } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<UserRole, typeof Home> = { host: Home, seeker: Search };

export function ProfileForm({
  profile,
  userId,
  universityName,
  email,
}: {
  profile: Profile;
  userId: string;
  universityName: string | null;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);
  const [role, setRole] = useState<UserRole>(profile.role ?? "seeker");

  useEffect(() => {
    if (state?.success) toast.success("Profil güncellendi.");
    if (state?.error) toast.error(state.error);
  }, [state]);

  const fallback = (profile.full_name ?? email)
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <form action={formAction} className="space-y-8">
      <AvatarUploader userId={userId} initialUrl={profile.avatar_url} fallback={fallback || "?"} />

      {/* Verified university info (read-only) */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
          <BadgeCheck className="size-4" /> Doğrulanmış
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <GraduationCap className="size-4" />
          {universityName ?? "Üniversite"} · {email}
        </span>
      </div>

      <div className="space-y-2">
        <Label>Rol</Label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => {
            const Icon = ROLE_ICONS[r];
            const active = role === r;
            return (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40 hover:bg-muted",
                )}
              >
                <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-semibold">{ROLE_LABELS[r]}</span>
                <span className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Bölüm</Label>
          <Input
            id="department"
            name="department"
            defaultValue={profile.department ?? ""}
            placeholder="Bilgisayar Mühendisliği"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="graduationDate">Tahmini mezuniyet tarihi</Label>
          <Input
            id="graduationDate"
            name="graduationDate"
            type="date"
            defaultValue={profile.graduation_date ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Kısa tanıtım</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
          placeholder="Kendinden, alışkanlıklarından ve aradığın ev arkadaşından kısaca bahset."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Kaydet
        </Button>
      </div>
    </form>
  );
}
