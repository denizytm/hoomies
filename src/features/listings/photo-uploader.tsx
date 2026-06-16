"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { MAX_LISTING_PHOTOS, MIN_LISTING_PHOTOS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { LISTING_BUCKET, publicImageUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

export function PhotoUploader({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string[];
  onChange: (paths: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (value.length + files.length > MAX_LISTING_PHOTOS) {
      toast.error(`En fazla ${MAX_LISTING_PHOTOS} fotoğraf yükleyebilirsin.`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const added: string[] = [];

    for (const file of files) {
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
      added.push(path);
    }

    onChange([...value, ...added]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(path: string) {
    const supabase = createClient();
    await supabase.storage.from(LISTING_BUCKET).remove([path]);
    onChange(value.filter((p) => p !== path));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((path, i) => (
          <div
            key={path}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
          >
            <Image
              src={publicImageUrl(LISTING_BUCKET, path)!}
              alt={`Fotoğraf ${i + 1}`}
              fill
              className="object-cover"
              sizes="200px"
            />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                Kapak
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(path)}
              className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-background"
              aria-label="Fotoğrafı kaldır"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {value.length < MAX_LISTING_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50",
            )}
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            <span className="text-xs">Ekle</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onSelect}
      />
      <p className="text-xs text-muted-foreground">
        En az {MIN_LISTING_PHOTOS}, en fazla {MAX_LISTING_PHOTOS} fotoğraf. İlk fotoğraf
        kapak olur. ({value.length}/{MAX_LISTING_PHOTOS})
      </p>
    </div>
  );
}
