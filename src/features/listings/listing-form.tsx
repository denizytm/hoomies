"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createListingAction } from "@/features/listings/actions";
import { PhotoUploader } from "@/features/listings/photo-uploader";
import {
  GENDER_PREFERENCE_OPTIONS,
  LISTING_FEATURES,
  MIN_LISTING_PHOTOS,
} from "@/lib/constants";
import { CITIES, districtsFor } from "@/lib/data/locations";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function ListingForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(createListingAction, null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const enoughPhotos = photos.length >= MIN_LISTING_PHOTOS;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />

      <Section title="Fotoğraflar">
        <PhotoUploader userId={userId} value={photos} onChange={setPhotos} />
      </Section>

      <Section title="Temel bilgiler">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              name="title"
              placeholder="ODTÜ'ye yürüme mesafesinde, eşyalı 2+1'de oda"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Ev, ortak alanlar, mahalle ve aradığın ev arkadaşı hakkında bilgi ver."
            />
          </div>
        </div>
      </Section>

      <Section title="Konum">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Şehir</Label>
            <NativeSelect
              name="city"
              required
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setDistrict("");
              }}
            >
              <option value="" disabled>
                Seç
              </option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label>İlçe</Label>
            <NativeSelect
              name="district"
              required
              disabled={!city}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="" disabled>
                Seç
              </option>
              {districtsFor(city).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Semt / Mahalle (opsiyonel)</Label>
            <Input id="neighborhood" name="neighborhood" placeholder="Ör. Çayyolu" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Gizlilik için yalnızca ilçe/semt gösterilir; tam adres asla otomatik paylaşılmaz.
        </p>
      </Section>

      <Section title="Detaylar">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Aylık kira (₺)</Label>
            <Input id="monthlyRent" name="monthlyRent" inputMode="numeric" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit">Depozito (₺, opsiyonel)</Label>
            <Input id="deposit" name="deposit" inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Kiralık oda sayısı</Label>
            <NativeSelect name="roomCount" defaultValue="1">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} oda
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalRooms">Evdeki toplam oda (opsiyonel)</Label>
            <Input id="totalRooms" name="totalRooms" inputMode="numeric" placeholder="Ör. 3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flatmatesCount">Mevcut ev arkadaşı (opsiyonel)</Label>
            <Input id="flatmatesCount" name="flatmatesCount" inputMode="numeric" placeholder="Ör. 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableFrom">Müsait tarih (opsiyonel)</Label>
            <Input id="availableFrom" name="availableFrom" type="date" />
          </div>
          <div className="space-y-2">
            <Label>Cinsiyet tercihi</Label>
            <NativeSelect name="genderPreference" defaultValue="any">
              {GENDER_PREFERENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { name: "furnished", label: "Eşyalı" },
            { name: "petsAllowed", label: "Evcil hayvan kabul" },
            { name: "billsIncluded", label: "Faturalar dahil" },
          ].map((t) => (
            <label
              key={t.name}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:text-primary"
            >
              <input type="checkbox" name={t.name} value="true" className="size-4 accent-primary" />
              {t.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Özellikler">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LISTING_FEATURES.map((f) => (
            <label
              key={f.value}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:text-primary"
            >
              <input
                type="checkbox"
                name="features"
                value={f.value}
                className="size-4 accent-primary"
              />
              {f.label}
            </label>
          ))}
        </div>
      </Section>

      <div className="flex flex-col items-end gap-2">
        {!enoughPhotos && (
          <p className="text-sm text-muted-foreground">
            Yayınlamak için en az {MIN_LISTING_PHOTOS} fotoğraf ekle.
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || !enoughPhotos}>
          {pending && <Loader2 className="animate-spin" />}
          İlanı yayınla
        </Button>
      </div>
    </form>
  );
}
