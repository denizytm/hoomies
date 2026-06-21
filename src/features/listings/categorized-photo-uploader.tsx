"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { MAX_LISTING_PHOTOS, PHOTO_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { LISTING_BUCKET, publicImageUrl } from "@/lib/supabase/storage";

export type CategorizedPhoto = { path: string; category: string };

export function CategorizedPhotoUploader({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: CategorizedPhoto[];
  onChange: (photos: CategorizedPhoto[]) => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function onSelect(category: string, files: FileList | null) {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    if (value.length + list.length > MAX_LISTING_PHOTOS) {
      toast.error(`En fazla ${MAX_LISTING_PHOTOS} fotoğraf yükleyebilirsin.`);
      return;
    }
    setUploading(category);
    const supabase = createClient();
    const added: CategorizedPhoto[] = [];
    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} 5MB sınırını aşıyor.`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(LISTING_BUCKET).upload(path, file);
      if (error) {
        toast.error("Yükleme hatası: " + error.message);
        continue;
      }
      added.push({ path, category });
    }
    onChange([...value, ...added]);
    setUploading(null);
    const el = inputs.current[category];
    if (el) el.value = "";
  }

  async function remove(path: string) {
    const supabase = createClient();
    await supabase.storage.from(LISTING_BUCKET).remove([path]);
    onChange(value.filter((p) => p.path !== path));
  }

  return (
    <div className="space-y-5">
      {PHOTO_CATEGORIES.map((cat) => {
        const photos = value.filter((p) => p.category === cat.key);
        return (
          <div key={cat.key}>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              {cat.label}
              {photos.length === 0 && (
                <span className="text-xs font-normal text-destructive">(en az 1 gerekli)</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((p) => (
                <div
                  key={p.path}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <Image
                    src={publicImageUrl(LISTING_BUCKET, p.path)!}
                    alt={cat.label}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <button
                    type="button"
                    onClick={() => remove(p.path)}
                    className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-background/90 text-foreground shadow-sm"
                    aria-label="Kaldır"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {value.length < MAX_LISTING_PHOTOS && (
                <button
                  type="button"
                  onClick={() => inputs.current[cat.key]?.click()}
                  disabled={uploading === cat.key}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
                >
                  {uploading === cat.key ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ImagePlus className="size-5" />
                  )}
                  <span className="text-xs">Ekle</span>
                </button>
              )}
            </div>
            <input
              ref={(el) => {
                inputs.current[cat.key] = el;
              }}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onSelect(cat.key, e.target.files)}
            />
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        Her kategoriye en az 1, toplam en fazla {MAX_LISTING_PHOTOS} fotoğraf. (
        {value.length}/{MAX_LISTING_PHOTOS})
      </p>
    </div>
  );
}
