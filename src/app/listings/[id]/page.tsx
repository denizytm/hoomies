import { notFound } from "next/navigation";
import {
  Bath,
  CalendarDays,
  Check,
  Coins,
  Home,
  MapPin,
  PawPrint,
  Receipt,
  Sofa,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CapacityIcons } from "@/features/listings/capacity-icons";
import { CompatibilityBadge } from "@/features/listings/compatibility-badge";
import { ContactCard } from "@/features/listings/contact-card";
import { ListingMap } from "@/features/listings/listing-map";
import { ReportButton } from "@/features/moderation/report-button";
import { coordsFor } from "@/lib/data/coords";
import { PhotoGallery } from "@/features/listings/photo-gallery";
import { getListingById } from "@/features/listings/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import {
  FEATURE_LABELS,
  GENDER_PREFERENCE_LABELS,
} from "@/lib/constants";
import { formatDate, formatRent } from "@/lib/format";
import { LISTING_BUCKET, publicImageUrl } from "@/lib/supabase/storage";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const urls = listing.photos
    .map((p) => publicImageUrl(LISTING_BUCKET, p.storage_path))
    .filter((u): u is string => Boolean(u));
  const features = (listing.features as string[]) ?? [];
  const coords = coordsFor(listing.city, listing.district);

  const available = Math.max(listing.capacity - listing.occupied, 0);
  const facts = [
    listing.total_rooms ? { icon: Home, label: `${listing.total_rooms} odalı ev` } : null,
    listing.bathroom_count != null
      ? { icon: Bath, label: `${listing.bathroom_count} banyo/tuvalet` }
      : null,
    listing.deposit ? { icon: Coins, label: `${formatRent(listing.deposit)} depozito` } : null,
    listing.dues ? { icon: Receipt, label: `${formatRent(listing.dues)} aidat/ay` } : null,
    listing.available_from
      ? { icon: CalendarDays, label: `${formatDate(listing.available_from)} müsait` }
      : null,
  ].filter(Boolean) as { icon: typeof Home; label: string }[];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <PhotoGallery urls={urls} title={listing.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{listing.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4" />
                  {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
                  {listing.district}, {listing.city}
                </p>
                {listing.score != null && (
                  <CompatibilityBadge score={listing.score} className="mt-3 px-2.5 py-1 text-sm" />
                )}
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <CapacityIcons capacity={listing.capacity} occupied={listing.occupied} />
                  <span className="text-muted-foreground">
                    {available} müsait / {listing.capacity} kişilik
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatRent(listing.monthly_rent)}</p>
                <p className="text-sm text-muted-foreground">
                  / ay {listing.bills_included && "· faturalar dahil"}
                </p>
                {listing.dues ? (
                  <p className="text-xs text-muted-foreground">
                    + {formatRent(listing.dues)} aidat
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {listing.furnished && (
                <Badge variant="secondary">
                  <Sofa className="size-3.5" /> Eşyalı
                </Badge>
              )}
              {listing.pets_allowed && (
                <Badge variant="secondary">
                  <PawPrint className="size-3.5" /> Evcil hayvan kabul
                </Badge>
              )}
              <Badge variant="secondary">
                <Users className="size-3.5" /> {GENDER_PREFERENCE_LABELS[listing.gender_preference]}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm"
                >
                  <f.icon className="size-4 text-primary" />
                  {f.label}
                </div>
              ))}
            </div>

            {listing.description && (
              <div className="mt-8">
                <h2 className="font-semibold">Açıklama</h2>
                <p className="mt-2 whitespace-pre-line text-muted-foreground">
                  {listing.description}
                </p>
              </div>
            )}

            {features.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Özellikler</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-primary" />
                      {FEATURE_LABELS[f] ?? f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {coords && (
              <div className="mt-8">
                <h2 className="font-semibold">Konum</h2>
                <p className="mt-1 mb-3 text-sm text-muted-foreground">
                  {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
                  {listing.district}, {listing.city} — yaklaşık bölge (tam adres paylaşılmaz)
                </p>
                <ListingMap
                  lng={coords[0]}
                  lat={coords[1]}
                  label={`${listing.district}, ${listing.city} haritası`}
                />
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ContactCard
            listingId={listing.id}
            ownerName={listing.owner?.full_name ?? "Ev sahibi"}
            ownerAvatar={publicImageUrl("avatars", listing.owner?.avatar_url)}
            university={listing.ownerUniversity}
            department={listing.owner?.department ?? null}
            isOwner={listing.owner?.id === profile.id}
          />

          {listing.owner && listing.owner.id !== profile.id && (
            <div className="mt-3 flex justify-end">
              <ReportButton listingId={listing.id} reportedUserId={listing.owner.id} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
