import Link from "next/link";
import { Plus, SearchX } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/features/listings/listing-card";
import { ListingFilters } from "@/features/listings/listing-filters";
import { getListings } from "@/features/listings/queries";
import type { SortKey } from "@/lib/constants";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata = { title: "İlanlar" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireOnboardedProfile();
  const sp = await searchParams;

  const listings = await getListings(
    {
      city: sp.city || undefined,
      district: sp.district || undefined,
      minRent: sp.minRent ? Number(sp.minRent) : undefined,
      maxRent: sp.maxRent ? Number(sp.maxRent) : undefined,
      minAvailable: sp.minAvailable ? Number(sp.minAvailable) : undefined,
      pets: sp.pets === "true" ? true : undefined,
    },
    (sp.sort as SortKey) || "recommended",
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İlanlar</h1>
          <p className="mt-1 text-muted-foreground">
            Sana uygun oda ve ev arkadaşını keşfet.
          </p>
        </div>
        {profile.role !== "seeker" && (
          <Button render={<Link href="/listings/new" />}>
            <Plus /> İlan ver
          </Button>
        )}
      </div>

      <div className="mt-6">
        <ListingFilters />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{listings.length} ilan bulundu</p>

      {listings.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Kriterlerine uygun ilan yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtreleri genişletmeyi dene veya daha sonra tekrar bak.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => (
            <FadeIn key={listing.id} delay={Math.min(i * 0.04, 0.3)}>
              <ListingCard listing={listing} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
