import Link from "next/link";
import { LogOut, Plus, UserRound } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

function initialsOf(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string | null; avatar_url: string | null; role: string | null } | null =
    null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" render={<Link href="/listings" />}>
              İlanlar
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile?.role !== "seeker" && (
                <Button size="sm" render={<Link href="/listings/new" />}>
                  <Plus /> İlan Ver
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/listings/mine" />}
                className="hidden sm:inline-flex"
              >
                İlanlarım
              </Button>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted"
              >
                <Avatar size="sm">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
                  ) : null}
                  <AvatarFallback>{initialsOf(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
                  {profile?.full_name ?? "Profil"}
                </span>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="icon-sm" type="submit" aria-label="Çıkış yap">
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Giriş
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                <UserRound /> Kayıt ol
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
