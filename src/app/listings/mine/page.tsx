import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setListingStatusAction } from "@/features/listings/actions";
import { getMyListings } from "@/features/listings/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import type { ListingStatus } from "@/lib/types/database.types";
import { formatRent } from "@/lib/format";
import { LISTING_BUCKET, publicImageUrl } from "@/lib/supabase/storage";

const STATUS_LABEL: Record<ListingStatus, string> = {
  active: "Yayında",
  passive: "Pasif",
  matched: "Eşleşti",
  closed: "Kapalı",
};

const STATUS_VARIANT: Record<ListingStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  passive: "secondary",
  matched: "secondary",
  closed: "outline",
};

function StatusButton({ id, status, label }: { id: string; status: ListingStatus; label: string }) {
  return (
    <form action={setListingStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" size="sm">
        {label}
      </Button>
    </form>
  );
}

export const metadata = { title: "İlanlarım" };

export default async function MyListingsPage() {
  const profile = await requireOnboardedProfile();
  const listings = await getMyListings(profile.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">İlanlarım</h1>
        <Button render={<Link href="/listings/new" />}>
          <Plus /> İlan ver
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">Henüz ilanın yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            İlk ilanını oluştur ve uyumlu bir ev arkadaşı bul.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {listings.map((listing) => {
            const cover = publicImageUrl(LISTING_BUCKET, listing.photos[0]?.storage_path);
            return (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row"
              >
                <Link
                  href={`/listings/${listing.id}`}
                  className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44"
                >
                  {cover && (
                    <Image src={cover} alt={listing.title} fill className="object-cover" sizes="200px" />
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/listings/${listing.id}`} className="font-semibold hover:underline">
                      {listing.title}
                    </Link>
                    <Badge variant={STATUS_VARIANT[listing.status]}>
                      {STATUS_LABEL[listing.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {listing.district}, {listing.city} · {formatRent(listing.monthly_rent)}/ay
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    {listing.status === "active" && (
                      <>
                        <StatusButton id={listing.id} status="passive" label="Pasife al" />
                        <StatusButton id={listing.id} status="closed" label="Kapat" />
                      </>
                    )}
                    {listing.status === "passive" && (
                      <StatusButton id={listing.id} status="active" label="Yayına al" />
                    )}
                    {listing.status === "closed" && (
                      <StatusButton id={listing.id} status="active" label="Yeniden yayınla" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
