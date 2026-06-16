import { ListingForm } from "@/features/listings/listing-form";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata = { title: "İlan ver" };

export default async function NewListingPage() {
  const profile = await requireOnboardedProfile();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">İlan ver</h1>
      <p className="mt-1 text-muted-foreground">
        Odanı/evini tanıt, uyumlu bir ev arkadaşı bul. İlan 30 gün boyunca aktif kalır.
      </p>
      <div className="mt-8">
        <ListingForm userId={profile.id} />
      </div>
    </div>
  );
}
