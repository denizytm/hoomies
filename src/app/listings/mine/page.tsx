import Image from "next/image";
import Link from "next/link";
import { AlarmClock, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import {
  closeListingAction,
  extendListingAction,
  setListingStatusAction,
} from "@/features/listings/actions";
import { getMyListings } from "@/features/listings/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import { CLOSE_REASONS } from "@/lib/constants";
import type { ListingStatus } from "@/lib/types/database.types";
import { daysLeft, formatRent } from "@/lib/format";
import { LISTING_BUCKET, publicImageUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

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

function CloseForm({ id }: { id: string }) {
  return (
    <form action={closeListingAction} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <NativeSelect name="reason" defaultValue="matched" className="h-8 w-40 text-xs">
        {CLOSE_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </NativeSelect>
      <Button type="submit" variant="outline" size="sm">
        Kapat
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
            const days = daysLeft(listing.expires_at);
            const expired = days <= 0;
            const expiringSoon = !expired && days <= 5;
            const open = listing.status === "active" || listing.status === "passive";

            return (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row"
              >
                <Link
                  href={`/listings/${listing.id}`}
                  className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44"
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
                  {listing.status !== "closed" && (
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        expired || expiringSoon ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {expired ? "Süresi doldu" : `${days} gün kaldı`}
                    </p>
                  )}

                  {expiringSoon && listing.status !== "closed" && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      <AlarmClock className="size-4" />
                      Süre dolmak üzere — uzatmazsan ilan otomatik pasife alınır.
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                    {open && <CloseForm id={listing.id} />}
                    {listing.status === "active" && (
                      <StatusButton id={listing.id} status="passive" label="Pasife al" />
                    )}
                    {listing.status === "passive" && (
                      <StatusButton id={listing.id} status="active" label="Yayına al" />
                    )}
                    {listing.status === "closed" && (
                      <StatusButton id={listing.id} status="active" label="Yeniden yayınla" />
                    )}
                    {listing.status !== "closed" && (expiringSoon || expired) && (
                      <form action={extendListingAction}>
                        <input type="hidden" name="id" value={listing.id} />
                        <Button type="submit" size="sm">
                          <AlarmClock /> 30 gün uzat
                        </Button>
                      </form>
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
