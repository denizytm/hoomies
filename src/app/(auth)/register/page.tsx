"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Home, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/lib/types/database.types";
import { registerAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<UserRole, typeof Home> = { host: Home, seeker: Search };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null);
  const [role, setRole] = useState<UserRole>("seeker");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Kayıt ol</CardTitle>
        <CardDescription>
          Üniversite (edu) e-postanla hoomies topluluğuna katıl.
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Ne arıyorsun?</Label>
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

          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input id="fullName" name="fullName" placeholder="Deniz Yılmaz" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Üniversite e-postası</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ad.soyad@metu.edu.tr"
              autoComplete="email"
              required
            />
            <p className="text-xs text-muted-foreground">
              Yalnızca tanımlı üniversite uzantıları kabul edilir.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="En az 8 karakter"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referans kodu (opsiyonel)</Label>
            <Input id="referralCode" name="referralCode" placeholder="ARKADAŞ kodu" />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Onay maili gönder
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
