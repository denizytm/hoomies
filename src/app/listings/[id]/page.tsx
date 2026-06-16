import { notFound } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  Check,
  Coins,
  Home,
  MapPin,
  PawPrint,
  Sofa,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ContactCard } from "@/features/listings/contact-card";
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

  const facts = [
    { icon: BedDouble, label: `${listing.room_count} kiralık oda` },
    listing.total_rooms ? { icon: Home, label: `${listing.total_rooms} odalı ev` } : null,
    listing.flatmates_count != null
      ? { icon: Users, label: `${listing.flatmates_count} ev arkadaşı` }
      : null,
    listing.deposit ? { icon: Coins, label: `${formatRent(listing.deposit)} depozito` } : null,
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
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatRent(listing.monthly_rent)}</p>
                <p className="text-sm text-muted-foreground">
                  / ay {listing.bills_included && "· faturalar dahil"}
                </p>
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
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ContactCard
            ownerName={listing.owner?.full_name ?? "Ev sahibi"}
            ownerAvatar={publicImageUrl("avatars", listing.owner?.avatar_url)}
            university={listing.ownerUniversity}
            department={listing.owner?.department ?? null}
            isOwner={listing.owner?.id === profile.id}
          />
        </aside>
      </div>
    </div>
  );
}
