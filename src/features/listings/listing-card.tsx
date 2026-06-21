import Image from "next/image";
import Link from "next/link";
import { ImageOff, MapPin, PawPrint, Sofa } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CapacityIcons } from "@/features/listings/capacity-icons";
import { CompatibilityBadge } from "@/features/listings/compatibility-badge";
import type { ListingWithPhotos } from "@/features/listings/queries";
import { formatRent } from "@/lib/format";
import { LISTING_BUCKET, publicImageUrl } from "@/lib/supabase/storage";

export function ListingCard({ listing }: { listing: ListingWithPhotos }) {
  const cover = publicImageUrl(LISTING_BUCKET, listing.photos[0]?.storage_path);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <div className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-sm font-bold shadow-sm backdrop-blur">
          {formatRent(listing.monthly_rent)}
          <span className="font-normal text-muted-foreground">/ay</span>
        </div>
        {listing.score != null && (
          <CompatibilityBadge
            score={listing.score}
            className="absolute top-3 right-3 border-transparent bg-background/95 px-2.5 py-1 shadow-sm backdrop-blur"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{listing.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {listing.district}, {listing.city}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <CapacityIcons capacity={listing.capacity} occupied={listing.occupied} />
          <span>{Math.max(listing.capacity - listing.occupied, 0)} müsait</span>
          {listing.total_rooms ? <span>· {listing.total_rooms} oda</span> : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.furnished && (
            <Badge variant="secondary">
              <Sofa className="size-3.5" /> Eşyalı
            </Badge>
          )}
          {listing.pets_allowed && (
            <Badge variant="secondary">
              <PawPrint className="size-3.5" /> Evcil ✓
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
